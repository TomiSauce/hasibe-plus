class View {

	static getInpValue(inpID) {
		return View.escapeHtml($('#' + inpID).val());
	}

	static setInpValue(inpID, value = '') {
		$('#' + inpID).val(value).change();
	}

	static alert(msg) {
		alert(msg);
	}

	static confirm(msg) {
		return confirm(msg);
	}

	static error(msg, attachTo=null) {
		if (Config.getAll()[0].get('sound')) new Audio('./assets/audio/error.wav').play();
		if (attachTo) {
			this.#attachTo(msg, 'error', attachTo);
		} else {
			$.notify(msg, 'error');
		}
	}

	static success(msg, attachTo=null) {
		if (Config.getAll()[0].get('sound')) new Audio('./assets/audio/success.wav').play();
		if (attachTo) {
			this.#attachTo(msg, 'success', attachTo);
		} else {
			$.notify(msg, 'success');
		}
	}

	static warn(msg, attachTo=null) {
		if (Config.getAll()[0].get('sound')) new Audio('./assets/audio/notification.ogg').play();
		if (attachTo) {
			this.#attachTo(msg, 'warn', attachTo);
		} else {
			$.notify(msg, 'warn');
		}
	}

	static playSound(fileName) {
		if (Config.getAll()[0].get('sound')) new Audio('./assets/audio/' + fileName).play();
	}

	static #attachTo(msg, status, attachTo) {
		$('#' + attachTo).notify(msg, status, {position: 'bottom left'});
	}

	static isVisible(elemID) {
		return $('#' + elemID).is(":visible");
	}

	static getReadableHourMinDate(time) {
		let d = new Date(time);
		return this.fTime(d.getHours()) + ':' + this.fTime(d.getMinutes()) + ' / ' + this.fTime(d.getDate()) + '.' + this.fTime(d.getMonth()) + '.' + d.getFullYear();
	}
	
	static fTime(time) {
		return ('0'+time).slice(-2);
	}

	static getReadableMinSec(time) {
		let isNegative = time < 0;
		let absTime = Math.abs(time);
		let minutes = Math.floor(absTime / 60000); // Convert milliseconds to minutes
		let seconds = Math.floor((absTime % 60000) / 1000); // Remaining seconds
		let readableTime = `${this.fTime(minutes)}:${this.fTime(seconds)}`;
		return isNegative ? `-${readableTime}` : readableTime;
	}

	static escapeHtml(input) {
		return input
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;");
	}

}
