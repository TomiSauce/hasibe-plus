class Language extends ORM {

    constructor(id = null, name, icon) {
        super(id, {'name':name, 'icon':icon});
    }

}