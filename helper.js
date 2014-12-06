processAttributes = function(optionHash) {
  var attr = [], bool = ['novalidate', 'autofocus', 'formnovalidate', 'multiple', 'required'];

  attr = _.map(optionHash, function(value, key) {
    if (_.contains(bool, key)) {
      // boolean attributes like <input required>
      return key;
    } else {
      // normal attributes like <input autocomplete="off">
      return key + '="' + value + '"';
    }
  });

  return attr.join(' ');
}

processLabel = function(optionsHash, field) {
  if (_.isString(optionsHash['label'])) {
    label_words = optionsHash['label']
    delete optionsHash['label'];
  } else {
    label_words = _.humanize(field)
  }
  return label_words
}

buildLabel = function(optionsHash, field) {
  if (optionsHash['label'] === false) {
    return ''
  } else {
    label_words = processLabel(optionsHash, field)
    return "<label for='"+ field +"'>" + label_words + "</label>"
  }
}

buildHintBlock = function(optionsHash) {
  if (optionsHash['hint']) {
    hintBlock = "<span class='help-block'>" + optionsHash['hint'] + "</span>";
    delete optionsHash['hint'];
  } else {
    hintBlock = "";
  }
  return hintBlock;
}

buildBeforeAddon = function(optionsHash) {
  addon = ""
  if (optionsHash['before'] || optionsHash['after']) {
    addon = "<div class='input-group'>"
    if (optionsHash['before']) {
      addon = addon + "<span class='input-group-addon'>" + optionsHash['before'] + "</span>"
    }
  }
  return addon
}

buildAfterAddon = function(optionsHash) {
  addon = ""
  if (optionsHash['before'] || optionsHash['after']) {
    if (optionsHash['after']) {
      addon = "<span class='input-group-addon'>" + optionsHash['after'] + "</span>"
    }
    addon = addon + "</div>"
  }
  return addon
}

processForBelongsTo = function(field, object) {
  name = object.constructor.name
  if (!window[name]) {
    return false
  }
  isAssociation = _.contains(_.pluck(window[name].belongs_to, 'name'), field)
  if (isAssociation) {
    associations = window[_.classify(field)].all()
    var array = [];
    _.each(associations, function(association) {
      array.push({value: association._id, name: association.name})
    })
    return array
  } else {
    return false
  }
}

processForHaBTM = function(field, object) {
  name = object.constructor.name
  if (!window[name]) {
    return false
  }
  isAssociation = _.contains(_.pluck(window[name].has_and_belongs_to_many, 'name'), field)
  if (isAssociation) {
    associations = window[_.classify(_.singularize(field))].all()
    var array = [];
    _.each(associations, function(association) {
      array.push({value: association._id, name: association.name})
    })
    return array
  } else {
    return false
  }
}

buildAssociationCheckboxes = function(field, object, checkboxes, options) {
  return false
  builtCheckboxes = _.map(checkboxes, function(checkbox) {
    attributes = processAttributes(_.extend(options.hash, {
      name: checkbox.name,
      value: checkbox.value
    }));
    checked = _.contains(object[_.singularize(field) + '_ids'], checkbox.value) === true ? ' checked' : '';
    label = processLabel(options.hash, checkbox.name)
    html = "<label for='"+ checkbox.name +"'><input id='"+ checkbox.name +"' name='" + checkbox.name + "' type='hidden' value='false'>";
    html += "<input " + attributes + " type='checkbox'" + checked + ">" + label + "</label>";
    return html;
  });
  return new Spacebars.SafeString(builtCheckboxes.join(' '));
}

/*----- HELPERS ------*/

UI.registerHelper('text_field', function(field, options){
  var _this = this;
  if (!field) {
    return;
  }
  _.defaults(options.hash, {
    class: 'form-control',
    type: 'text'
  });
  value = _this[field] || ""
  type = options.hash['type']
  if (value && type === "date" && value.constructor === Date) {
    value = value.getFullYear() + '-' + ('0' + (value.getMonth()+1)).slice(-2) + "-" + ('0' + value.getDate()).slice(-2)
  }
  attributes = processAttributes(options.hash);
  html = "<input id='" + field + "' name='" + field + "' value='" + value + "' " + attributes + ">"
  label = buildLabel(options.hash, field)
  hint = buildHintBlock(options.hash)
  beforeAddon = buildBeforeAddon(options.hash)
  afterAddon = buildAfterAddon(options.hash)
  return new Spacebars.SafeString(label + beforeAddon + html + afterAddon + hint);
});

UI.registerHelper('text_area', function(field, options){
  var _this = this;
  if (!field) {
    return;
  }
  _.defaults(options.hash, {
    class: 'form-control'
  });
  value = _this[field] || ""
  label = buildLabel(options.hash, field)
  hint = buildHintBlock(options.hash)
  attributes = processAttributes(options.hash);
  html = "<textarea id='" + field + "' name='" + field + "' " + attributes + ">"+ value +"</textarea>"
  return new Spacebars.SafeString(label + html + hint);
});

UI.registerHelper('select_box', function(field, options) {
  _this = this;
  optionsValues = undefined
  if (!field) {
    return;
  }
  _.defaults(options.hash, {
    class: 'form-control'
  });

  associationOptions = processForBelongsTo(field, _this)

  if (associationOptions) {
    optionsValues = associationOptions
    dbField = field + "_id"
  } else {
    dbField = field
    if (options.hash.optionValues && options.hash.optionValues.length > 0) {
      optionsValues = options.hash.optionValues
      delete options.hash.optionValues;
    } else {
      optionsValues = _this["" + field + "Options"]();
    }
  }

  html_options = [];
  _.each(optionsValues, function(option) {
    name = option.name || _.humanize(option)
    value = option.value || option
    selected = _this[field] === value ? ' selected' : '';
    return html_options.push("<option value='" + value + "'" + selected + ">" + name + "</option>");
  });
  attributes = processAttributes(options.hash);
  html = "<select name='" + dbField + "'" + attributes + ">" + (html_options.join('')) + "</select>"
  label = buildLabel(options.hash, dbField)
  hint = buildHintBlock(options.hash)
  return new Spacebars.SafeString(label + html + hint);
});


UI.registerHelper('check_box', function(field, options) {
  var capitalizedField, checked;
  if (!field) {
    return;
  }
  associationOptions = null//processForHaBTM(field, this)
  if (associationOptions) {
    return buildAssociationCheckboxes(field, this, associationOptions, options)
  } else {
    checked = this[field] === 'true' ? ' checked' : '';
    label = processLabel(options.hash, field)
    attributes = processAttributes(options.hash);
    html = "<label for='"+ field +"'><input id='"+ field +"' name='" + field + "' type='hidden' value='false'>";
    html += "<input name='" + field + "' type='checkbox' value='true' " + checked + attributes + ">" + label + "</label>";
    hint = buildHintBlock(options.hash)
    return new Spacebars.SafeString(html + hint);
  }
});

UI.registerHelper('file_field', function(){
  if (Package['schnie:uploader']) {
    this.settings = {
      name: this.field,
      onUpload: function(error, result) {
        if (result) {
          $('input[name="'+ this.name +'Url"').val(result.url)
          $('input[name="'+ this.name +'OriginalFileName"').val(result.originalFileName)
          Session.set(this.name + 'OriginalFileName', result.originalFileName)
          Session.set(this.name + 'Url', result.url)
        } else {
          console.log(error)
        }
      }
    }
    return Template['simpleFormFileField']
  }
});

UI.registerHelper('submit_button', function(text, options){
  var _this = this;
  if (!text && !options) {
    options = {};
  }
  if (text && text.hash) {
    options = text;
    text = undefined;
  }
  _.defaults(options.hash, {
    class: 'btn btn-default'
  });
  klass = _this.constructor.name;
  if (_this._id) {
    actionWord = "Update "
  } else {
    actionWord = "Add "
  }
  value = text || actionWord + klass;
  if (options.hash && options.hash['button']) {
    delete options.hash['button'];
    attributes = processAttributes(options.hash);
    html = "<button type='submit'" + processAttributes(options.hash) + ">" + value + "</button>";
  } else {
    html = "<input type='submit' value='"+ value +"'" + processAttributes(options.hash) + ">";
  }
  return new Spacebars.SafeString(html);
});
