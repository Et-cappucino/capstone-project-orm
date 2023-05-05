const { Cast, APIKEY } = require("../config/server");
const axios = require("axios");

// 1 page = 20 item
const NUMBER_OF_PAGES = 1;

// number of actors per watchable to be added to DB
const CAST_STATIC_SIZE = 10; 

async function test() {

  for(let i = 1; i <= NUMBER_OF_PAGES; i++) {

    const movies = await axios.get(
      `https://api.themoviedb.org/3/movie/popular?api_key=${APIKEY}&language=en-US&page=${i}`
    );

    const series = await axios.get(
      `https://api.themoviedb.org/3/tv/popular?api_key=${APIKEY}&language=en-US&page=${i}`
    );

      const moviesIds = movies.data.results.map(item => item.id);
      const seriesIds = series.data.results.map(item => item.id);

      const ids = [...moviesIds, ...seriesIds];

      const moviesCreditsData = await Promise.all(moviesIds.map(async id => {        
        return (await axios.get(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=${APIKEY}&language=en-US`)).data
      }));

      const seriesCreditsData = await Promise.all(seriesIds.map(async id => {        
        return (await axios.get(`https://api.themoviedb.org/3/tv/${id}/credits?api_key=${APIKEY}&language=en-US`)).data
      }));

      const watchableCreditsData = [...moviesCreditsData, ...seriesCreditsData];

      const dbData = [];

      for(let i = 0; i < watchableCreditsData.length; i++) {
        let castSize = watchableCreditsData[i].cast.length <= CAST_STATIC_SIZE 
          ? watchableCreditsData[i].cast.length : CAST_STATIC_SIZE;

        for(let j = 0; j < castSize; j++) {
            const castActor = {            
                    watchable_id: ids[i],                        
                    actor_id: watchableCreditsData[i].cast[j].id       
            }
            dbData.push(castActor);
        }
      }
      
      await Cast.bulkCreate(dbData, {
        ignoreDuplicates: true,
      });
  }
}

(async () => await test())();



// run command "node Cast.js" from terminal
