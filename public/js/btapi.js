var btapi = {

  getCards : function (year,noofcards,excludeIDs){
			return $.ajax("../movies/year/"+year+"/cards/"+noofcards+"/exclude/"+excludeIDs)
	}
}
