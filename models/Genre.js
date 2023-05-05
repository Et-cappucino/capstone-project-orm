const { Genre, APIKEY } = require("./config/server");
const axios = require("axios");

// 1 page = 20 item
const NUMBER_OF_PAGES = 3;   

async function test() {

  for(let i = 1; i <= NUMBER_OF_PAGES; i++) {
    
    const movies = await axios.get(
      `https://api.themoviedb.org/3/movie/popular?api_key=${APIKEY}&language=en-US&page=${i}`
    );
      
    const series = await axios.get(
      `https://api.themoviedb.org/3/tv/popular?api_key=${APIKEY}&language=en-US&page=${i}`
    );

      const movieIds = movies.data.results.map(item => item.id);
      const seriesIds = series.data.results.map(item => item.id);

      const movieData = await Promise.all(movieIds.map(async id => {        
          return (await axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=${APIKEY}&language=en-US`)).data
      }));

      const seriesData = await Promise.all(seriesIds.map(async id => {        
        return (await axios.get(`https://api.themoviedb.org/3/tv/${id}?api_key=${APIKEY}&language=en-US`)).data
      }));

      const watchableData = [...movieData, ...seriesData];
 
      const fullData = watchableData.flatMap(watchable => 
        watchable.genres.map(genre => ({
          watchable_id: watchable.id,
          genre: genre.name.split(' ').join('_').toUpperCase()
          }))
      );
          
      // filtering out unnecessary genres 
      const filteredData = fullData.filter(item => {
        return item.genre !== 'SOAP' && item.genre !== 'REALITY' && item.genre !== 'KIDS' 
          && item.genre !== 'TALK' && item.genre !== 'NEWS' && item.genre !== 'WAR_&_POLITICS';
      });

      // splitting genres in case of two combined genre names
      const dbData = filteredData.flatMap(watchable => {
        if (watchable.genre === 'SCI-FI_&_FANTASY') {
          return [
            {
              watchable_id: watchable.watchable_id, 
              genre: 'SCIENCE_FICTION'
            },
            {
              watchable_id: watchable.watchable_id, 
              genre: 'FANTASY'
            }
          ];
        } else if (watchable.genre === 'ACTION_&_ADVENTURE') {
          return [
            {
              watchable_id: watchable.watchable_id, 
              genre: 'ACTION'
            },
            {
              watchable_id: watchable.watchable_id,
              genre: 'ADVENTURE'
            }
          ];
        } else {
          return [watchable];
        }
      });

      await Genre.bulkCreate(dbData, {
        ignoreDuplicates: true,
      });
  }
}

(async () => await test())();



// run command "node Genre.js" from terminal
