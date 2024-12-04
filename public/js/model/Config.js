class Config extends ORM {

    constructor(id = null, video=false, sound=false) {
        super(id, {'video': video, 'sound':sound});
    }

}