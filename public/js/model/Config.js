class Config extends ORM {

    constructor(id = null, video=false, sound=true) {
        super(id, {'video': video, 'sound':sound});
    }

}