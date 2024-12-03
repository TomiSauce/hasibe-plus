class ImportController {

	static parseExcel(event) {
		let file = event.target.files[0];
		try {
			let reader = new FileReader();
			reader.onload = (e) => {
				let data = e.target.result;
				try {
					let workbook = XLSX.read(data, {
						type: 'binary'
					});
					try {
						workbook.SheetNames.forEach(function(sheetName) {
							let users = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]),
								c = 0,
								ranks = Rank.getAll(),
								languages = Language.getAll(),
								flagID = Flag.getAll()[0].get('id'),
								taskID = DefaultTask.getAll()[0].get('taskID');

							if (users.length == 0) {
								View.alert('Die Datei scheint leer zu sein. Wenn dies nicht der fall ist öffnen Sie die Datei und speichern Sie sie unter einem neuem Namen.');
								return;
							}
							let arrayKeys = [];
							
							if (users[0]['Name / Vorname'] !== undefined) {
								// Import file language is German
								arrayKeys = {
									'name': 'Name / Vorname',
									'rank': 'Grad Kurzform',
									'lang': 'Sprache'
								};
							} else if (users[0]['Nom / Prénom:'] !== undefined) {
								// Import file language is French
								arrayKeys = {
									'name': 'Nom / Prénom:',
									'rank': 'Grade abrégé',
									'lang': 'Langue'
								};
							} else if (users[0]['Nome / cognome'] !== undefined) {
								// Import file language is Italian
								arrayKeys = {
									'name': 'Nome / cognome',
									'rank': 'Grado abbreviato',
									'lang': 'Lingua'
								};
							}
			
							for (let user of users) {
								let u = new User(),
									name = "";
								
								let isLangSet = false;
								try {
									for (const lang of languages) {
										if (lang.get('name') == user[arrayKeys['lang']]) {
											u.set('languageID', lang.get('id'));
											isLangSet = true;
											break;
										}
									}
								} catch (error) {
									isLangSet = false;
								}

								if (!isLangSet) {
									u.set('languageID', 0);
								}

								try {
									name = user[arrayKeys['name']].split(',');
									u.set('firstName', View.escapeHtml(name[1].trim()));
									u.set('lastName', View.escapeHtml(name[0].trim()));
									u.set('taskID', taskID);
									u.set('flagID', flagID);
								} catch (e) {
									View.error('Ungültiger Name für AdA auf Zeile: "' + (c+2) + '" ');
									return;
								}

								let isRankSet = false;
								try {
									for (let rank of ranks) {
										if (rank.get('abbr') == user[arrayKeys['rank']].trim()) {
											u.set('rankID', rank.get('id'));
											isRankSet = true;
											break;
										};
									}
								} catch (e) {
									isRankSet = false;
								}

								if (!isRankSet) {
									let newRank = new Rank();
									newRank.set('abbr', user[arrayKeys['rank']]).save();
									u.set('rankID', newRank.get('id'));
								}
			
								u.save();
								c += 1;
							}
							View.success('"' + c + '" neue AdAs hinzugefüght.');
							UserController.refreshTable();
							DataController.refresh();
						});
					} catch (ex) {
						View.error('Die Datei "' + file.name + '" konnte nicht geladen werden #007');
						console.error(ex);
					}
					
				} catch (ex) {
					View.error('Die Datei "' + file.name + '" konnte nicht geladen werden #EKF');
					console.error(ex);
				}
			};
	
			reader.onerror = function(ex) {
				View.error('Die Datei "' + file.name + '" konnte nicht geladen werden #ELOOPS');
				console.error(ex);
			};
	
			reader.readAsBinaryString(file);
		} catch (e) {
			View.error('Die Datei "' + file.name + '" konnte nicht geladen werden #0600');
			console.error(ex);
		}
	}

}
