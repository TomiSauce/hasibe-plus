class ConfigController {
    static applyConfig() {
        let config = Config.getAll()[0];

        if (config.get('sound')) {
			$('#volume-switch-icon').removeClass('fa-volume-xmark').addClass('fa-volume-high');
		} else {
			$('#volume-switch-icon').addClass('fa-volume-xmark').removeClass('fa-volume-high');
		}

        if (config.get('video')) {
			$('#btn-toggle-cam-display').val('Kamera ausblenden');
			$('#camera-canvas').show();
		} else {
			$('#btn-toggle-cam-display').val('Kamera einblenden');
			$('#camera-canvas').hide();
		}
    }

    static toggleSound() {
        let config = Config.getAll()[0];
        config.set('sound', !config.get('sound')).save();
        this.applyConfig();
    }

    static toggleVideo() {
        let config = Config.getAll()[0];
        config.set('video', !config.get('video')).save();
        this.applyConfig();
    }
}