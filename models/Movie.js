const { Watchable, APIKEY } = require("../config/server");
const axios = require("axios");

// 1 page = 20 item
const NUMBER_OF_PAGES = 1;   

async function test() {

  for(let i = 1; i <= NUMBER_OF_PAGES; i++) {

    const movies = await axios.get(
      `https://api.themoviedb.org/3/movie/popular?api_key=${APIKEY}&language=en-US&page=${i}`
    );
    
      const ids = movies.data.results.map(item => item.id);

      const moviesData = await Promise.all(ids.map(async id => {        
          return (await axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=${APIKEY}&language=en-US`)).data
      }));

      const moviesTrailerData = await Promise.all(ids.map(async id => {        
        return (await axios.get(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=${APIKEY}&language=en-US`)).data
      }));
      
      const dbData = moviesData.map((item, index) => {
        return {
          id: item.id,
          name: item.title,
          type: 'MOVIE',
          release_date: item.release_date,
          description: item.overview,
          rating: item.vote_average,
          vote_count: item.vote_count,
          duration: item.runtime,
          poster_path: item.poster_path,
          main_backdrop_path: item.backdrop_path,
          trailer_link: moviesTrailerData[index].results.length === 0 ? "" 
          : (moviesTrailerData[index].results
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


// run command "node Movie.js" from terminal
