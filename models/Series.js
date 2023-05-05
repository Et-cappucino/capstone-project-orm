const { Watchable, APIKEY } = require("../config/server");
const axios = require("axios");

// 1 page = 20 item
const NUMBER_OF_PAGES = 1;     

async function test() {

  for(let i = 1; i <= NUMBER_OF_PAGES; i++) {

    const series = await axios.get(
      `https://api.themoviedb.org/3/tv/popular?api_key=${APIKEY}&language=en-US&page=${i}`
    );
    
      const ids = series.data.results.map(item => item.id);

      const seriesData = await Promise.all(ids.map(async id => {        
          return (await axios.get(`https://api.themoviedb.org/3/tv/${id}?api_key=${APIKEY}&language=en-US`)).data
      }));

      const seriesTrailerData = await Promise.all(ids.map(async id => {        
        return (await axios.get(`https://api.themoviedb.org/3/tv/${id}/videos?api_key=${APIKEY}&language=en-US`)).data
      }));

      const dbData = seriesData.map((item, index) => {
        return {
          id: item.id,
          name: item.name,
          type: 'SERIES',
          release_date: item.first_air_date,
          description: item.overview,
          rating: item.vote_average,
          vote_count: item.vote_count,
          duration: item.episode_run_time[0],
          poster_path: item.poster_path,
          main_backdrop_path: item.backdrop_path,
          trailer_link: seriesTrailerData[index].results.length === 0 ? "" 
          : (seriesTrailerData[index].results
             .filter(result => result && 
                               (result.type === 'Trailer' && result.site === "YouTube" && 
                                (result.name.toLowerCase().includes("official trailer") || result.name.toLowerCase().includes("trailer"))))[0] || {}).key || ""
        }
      });

      await Watchable.bulkCreate(dbData, {
        ignoreDuplicates: true,
      });
  }
}

(async () => await test())();


// run command "node Series.js" from terminal
