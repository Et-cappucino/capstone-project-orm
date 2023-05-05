const { Backdrop, APIKEY } = require("../config/server");
const axios = require("axios");

// 1 page = 20 item
const NUMBER_OF_PAGES = 1; 

// number of backdrops per watchable to be added to DB
const BACKDROPS_STATIC_SIZE = 7; 

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

      const movieImagesData = await Promise.all(moviesIds.map(async id => {        
          return (await axios.get(`https://api.themoviedb.org/3/movie/${id}/images?api_key=${APIKEY}&language=en-US&include_image_language=null`)).data
      }));

      const seriesImagesData = await Promise.all(seriesIds.map(async id => {        
        return (await axios.get(`https://api.themoviedb.org/3/tv/${id}/images?api_key=${APIKEY}&language=en-US&include_image_language=null`)).data
      }));

      const watchableImagesData = [...movieImagesData, ...seriesImagesData];
 
      const dbData = [];

      for(let i = 0; i < watchableImagesData.length; i++) {
        let backdropSize = watchableImagesData[i].backdrops.length <= BACKDROPS_STATIC_SIZE 
            ? watchableImagesData[i].backdrops.length : BACKDROPS_STATIC_SIZE;

        for(let j = 0; j < backdropSize; j++) {
            const backdrop = {            
                    watchable_id: ids[i],                        
                    backdrop_path: watchableImagesData[i].backdrops[j].file_path      
            }
            dbData.push(backdrop);
        }
      }
          
      await Backdrop.bulkCreate(dbData, {
        ignoreDuplicates: true,
      });
  }
}

(async () => await test())();



// run command "node Backdrop.js" from terminal
