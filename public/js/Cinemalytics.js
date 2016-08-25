var cinemalytics = {
  auth_token:"5815F7C24CBFCB54352C87293EE4F01B",
  getMoviesByYear : function (year){
			return $.ajax("http://api.cinemalytics.in/v2/movie/year/"+year+"/?auth_token="+cinemalytics.auth_token)
	},
  getSongsByMovieId : function (movieid){
			return $.ajax("http://api.cinemalytics.in/v2/movie/"+movieid+"/songs/?auth_token="+cinemalytics.auth_token)
	}
}
