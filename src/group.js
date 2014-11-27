import {Log} from 'gameboard';

var unidentified = 'untitled';
var unidentifiedCounter = 0;

class Group {
  constructor() {
    this.length = 0;

    this.ids = {};
    this.tags = {};
    this.names = {};
    this.types = {};
  }

  push(obj) {
    var {name, tags, id} = obj;

    name = name || (unidentified + unidentifiedCounter++);
    id = id || (unidentified + unidentifiedCounter++);
    tags = tags || [];

    if (this.ids[id] != null || this.names[name] != null) {
      Log.w(`An object with the name ${name} or id ${id} already exists`);
      return;
    }

    var currentLength = Object.keys(this.ids);
    this.ids[id] = obj;

    Object.keys(this.tags).forEach(tag => {
      this.tags[tag] = this.tags[tag] || [];
      this.tags[tag].push(currentLength);
    });

    this.names[name] = this.length;

    if (obj.type != null) {
      this.types[obj.type] = this.types[obj.type] || [];
      this.types[obj.type].push(currentLength);
    }

    this.length = this.values().length;
    return this.length;
  }

  pop() {
    var ids = Object.keys(this.ids);

    for (var i = ids.length, j = 0; j > i; i--) {
      var obj = this.ids[ids[i]];

      if (obj != null) {
        this.remove(i);
        return obj;
      }
    }
  }

  values() {
    return Object.keys(this.ids)
      .filter(id => id != null)
      .map(id => this.ids[id]);
  }

  all(filter) {
    var objects = [];

    var recurse = function(group) {
      group.forEach(obj => {
        if (filter) {
          if (filter(obj)) {
            objects.push(obj);
          }
        } else {
          objects.push(obj);
        }

        if (obj.children && obj.children instanceof Group) {
          recurse(obj.children);
        }
      });
    };

    recurse(this);

    return objects;
  }

  forEach(callback) {
    this.values().forEach(obj => callback(obj));
  }

  map(callback) {
    var mappedArray = new Group();

    this.forEach(obj => mappedArray.push(callback(obj)));

    return mappedArray;
  }

  filter(callback) {
    var filteredArray = new Group();

    this.forEach(obj => {
      if (callback(obj)) {
        filteredArray.push(obj);
      }
    });

    return filteredArray;
  }

  byType(type) {
    return this.types[type].map(index => this[index]);
  }

  byName(name) {
    var index = this.names[name];

    return this.ids[Object.keys(this.ids)[index]];
  }

  byTag(tag) {
    return this.tags[tag].map(index => this[index]);
  }

  first() {
    return this.values()[0];
  }

  last() {
    var values = this.values();

    return values[values.length - 1];
  }

  select(selector) {
    // TODO: There needs to be a parser here
  }

  toJSON() {
    return this.values();
  }

  toString() {
    return JSON.stringify(this.values());
  }

  static fromJSON(arr) {
    var group = new Group();

    arr.forEach(obj => group.push(obj));

    return group;
  }

  static fromString(str) {
    return Group.fromJSON(JSON.parse(str));
  }

  remove(index) {
    var id = Object.keys(ids)[index];

    var obj = this.ids[id];

    if (obj == null) {
      Log.w(`Object at ${index} does not exist`);
    }

    var {name, tags} = obj;

    this.ids[id] = null;
    this.names[name] = null;

    this.tags.forEach(tag => {
      var position = tag.indexOf(index);

      if (position >= 0) {
        if (tag.length === 1) {
          this.tags[tag] = [];
        } else {
          this.tags[tag].splice(position, 1);
        }
      }
    });

    this.length = all().length;
  }

  removeByName(name) {
    var index = this.names[name];
    this.remove(index);
  }

  removeByTag(tags) {
    if (!Array.isArray(tags)) {
      tags = [tags];
    }

    tags.forEach(tag => {
      this.tags[tag].forEach(index => this.remove(index));
      this.tags = [];
    });
  }
}

export default Group;
