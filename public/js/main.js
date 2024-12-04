/**
 * Copyright (c) 2024 Luca Tomasi
 * Licensed under the MIT License. See LICENSE file for details.
 */
//
// Initialization
//

const objRelsORM = {
	flagID: Flag,
	logID: Log,
	rankID: Rank,
	taskID: Task,
	userID: User,
	languageID: Language
}

ORM.setStorageAdapter(new LocalStorage());

// Seed "Database"
if (!Flag.count()) {
	let flagSeeds = [
		'Neutral',
		'👌 Pünklich',
		'⚠️ Unpünktlich',
		'🚩 Ubooter!!'
	];

	for (let key in flagSeeds) {
		if (Object.hasOwnProperty.call(flagSeeds, key)) {
			new Flag(null, flagSeeds[key]).save();
			new Log(null, null, null, 'Flag "' + flagSeeds[key] + '" erstellt').save();
		}
	}
}

if (!Task.count()) {
	let taskSeeds = [
		{name: 'Undefiniert', minutes: null},
		{name: 'HäSiBe', minutes: null},
		{name: 'Rauchen', minutes: 10},
		{name: 'Pause', minutes: 15},
		{name: 'Kas Reinigung', minutes: null},
		{name: 'Wache', minutes: null},
		{name: 'Mat Mag', minutes: null},
		{name: 'Tech Mag', minutes: null},
		{name: 'Mun Mag', minutes: null},
		{name: 'Fassmanschaft', minutes: null},
		{name: 'Kas Reinigung', minutes: null},
		{name: 'Bewerbungsgespräch', minutes: null},
		{name: 'Quali Gespräch', minutes: null},
		{name: 'KP', minutes: null},
		{name: 'ZSA', minutes: null},
		{name: 'Krank im Zimmer', minutes: null}
	];
	
	for (let task of taskSeeds) {
		let t = new Task(null, task.name, task.minutes);
		t.save();
		new Log(null, null, t.get('id'), 'Task "' + task.name + '" erstellt').save();
	}
}

if (!DefaultTask.count()) {
	let dT = new DefaultTask(null, Task.getAll()[0].get('id'));
	dT.save();
	new Log(null, null, dT.get('id'), 'Default Task "' + dT.name + '" gesetzt').save();
}

if (!SearchID.count()) {
	let sID = new SearchID();
	sID.save();
	new Log(null, null, null, 'Seeded object for QR-Code searching').save();
} else {
	try {
		new SearchID(0).set('userID', null).save();
	} catch (e) {}
}

if (!Rank.count()) {
	let rankSeeds = [
		'Undefiniert',
		'Rekr',
		'Sdt',
		'Gfr',
		'Obgfr',
		'Kpl',
		'Wm',
		'Obwm',
		'Four',
		'Fw',
		'Hptfw',
		'Adj Uof',
		'Stabsadj',
		'Hptadj',
		'Chefadj',
		'Lt',
		'Oblt',
		'Hptm',
		'Maj',
		'Oberstlt',
		'Oberst i Gst',
		'Br',
		'Div',
		'KKdt',
		'General',
		'Ziv'
	];
	
	for (let key in rankSeeds) {
		if (Object.hasOwnProperty.call(rankSeeds, key)) {
			new Rank(null, rankSeeds[key]).save();
			new Log(null, null, null, 'Rang "' + rankSeeds[key] + '" erstellt').save();
		}
	}
}

if (!Language.count()) {
	let langSeeds = [
		{name: '?', icon:'-'},

		{name: 'Deutsch', icon:'de'},
		{name: 'Französisch', icon:'fr'},
		{name: 'Italienisch', icon:'it'},

		{name: 'Tedesco', icon:'de'},
		{name: 'Francese', icon:'fr'},
		{name: 'Italiano', icon:'it'},

		{name: 'Allemand', icon:'de'},
		{name: 'Français', icon:'fr'},
		{name: 'Italien', icon:'it'},
	];

	for (let lang of langSeeds) {
		new Language(null, lang.name, lang.icon).save();
		new Log(null, null, null, 'Sprache "' + lang.name + '" erstellt.').save();
	}
	
}

if (!Config.count()) {
	new Config().save();
}

$(document).ready(() => {
	UserController.refreshCreateForm();
	UserController.refreshTable();
	TaskController.refreshSetDefault();
	DataController.refresh(true);
	ConfigController.applyConfig()

	$('#btn-toggle-sound').on('click', () => {
		ConfigController.toggleSound();
	});

	let sort = JSON.parse(localStorage.getItem('sortBy'));
	if (sort !== null && sort['order'] !== null && sort['key'] !== null) {
		$('#sort' + sort['key'].charAt(0).toUpperCase() + sort['key'].slice(1) + ' > i')
			.removeClass('fa-sort')
			.addClass('fa-arrow-down-' + sort['order']);
	}
	$('#user-list-header').on('click', (e) => {
		let elemID = $(e.target).attr('id');
		if (!elemID) elemID = $(e.target).parent().attr('id');
		if (!$('#' + elemID).parent('#user-list-header').length) return;
		SortController.setSortParam(elemID); 
	});

	$('#btnClearStorage').on('click', () => {
		if (confirm('Sollen wirklich alle daten gelöscht werden. Diese könnne nicht wiederhergestellt werden.')) {
			localStorage.clear();
			View.success('Alle Daten wurden gelöscht.');
			setTimeout(() => {location.reload()}, 1000);
		}
	});

	$('#btn-toggle-cam-display').on('click', () => {
		ConfigController.toggleVideo();
	});

	setInterval(function() {
		// Todo Improve
		if ($('#section-user-list:hover').length == 0) UserController.refreshTable();
	}, 1000);

	$('#inpImport').on('change', ImportController.parseExcel);
	$('#btnAddUser').on('click', UserController.create);
	$('#btnAddTask').on('click', TaskController.create);
	$('#inpSearch').on('keyup', SearchController.search);
	$('#inpSearch').on('focus', SearchController.search);
	$('#btnDefaultTask').on('click', TaskController.setDefaultTask);

});