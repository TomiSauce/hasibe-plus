class SearchController {

	static search() {
		let searchID = SearchID.getAll()[0];
		searchID.set('userID', null).save();
		UserController.refreshTable();
	}

	static hideResults() {
		SearchView.hideResults();
	}

	static searchByID(userID) {
		let searchID = SearchID.getAll()[0];
		searchID.set('userID', userID).save();
		UserController.refreshTable();
	}

}
