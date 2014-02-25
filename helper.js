processClass = function(optionsHash) {
  if (optionsHash['class']) {
    html_class = " " + optionsHash['class']
  } else {
    html_class = ""
  }
  return html_class
}

processId = function(optionsHash) {
  if (optionsHash['id']) {
    return " id='" + optionsHash['id'] + "'";
  } else {
    return ""
  }
}

processValue = function(optionsHash) {
  if (optionsHash['value']) {
    return  optionsHash['value'];
  } else {
    return ""
  }
}

processPlaceHolder = function(optionsHash) {
  if (optionsHash['placeholder']) {
    placeholder = " placeholder='" + optionsHash['placeholder'] + "' "
  } else {
    placeholder = ""
  }
  return placeholder
}

processLabel = function(optionsHash, field) {
  if (_.isString(optionsHash['label'])) {
    label_words = optionsHash['label']
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

processForBelongsTo = function(field, object) {
  name = object.constructor.name
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

/*----- HELPERS ------*/

Handlebars.registerHelper('text_field', function(field, options){
  var _this = this;
  if (!field) {
    return;
  }
  value = _this[field] || processValue(options.hash)
  html_class = processClass(options.hash)
  type = options.hash['type'] || "text"
  placeholder = processPlaceHolder(options.hash)
  html = "<input type='"+ type +"' id='" + field + "' name='"+ field +"' value='"+ value +"' class='form-control"+ html_class +"'"+ placeholder +">"
  label = buildLabel(options.hash, field)
  return new Handlebars.SafeString(label + html);
});

Handlebars.registerHelper('text_area', function(field, options){
  var _this = this;
  if (!field) {
    return;
  }
  value = _this[field] || ""
  html_class = processClass(options.hash)
  if (options.hash['rows']) {
    rows = "rows='"+ options.hash['rows'] +"' "
  } else {
    rows = ""
  }

  html = "<textarea id='" + field + "' "+ rows +"name='"+ field +"' class='form-control"+ html_class +"'>"+ value +"</textarea>"
  label = buildLabel(options.hash, field)
  return new Handlebars.SafeString(label + html);
});

Handlebars.registerHelper('select_box', function(field, options) {
  _this = this;
  optionsValues = undefined
  if (!field) {
    return;
  }

  associationOptions = processForBelongsTo(field, _this)
  html_class = processClass(options.hash)

  if (associationOptions) {
    optionsValues = associationOptions
    dbField = field + "_id"
  } else {
    dbField = field
    if (options.hash.optionValues && options.hash.optionValues.length > 0) {
      optionsValues = options.hash.optionValues
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
  html = "<select class='form-control" + html_class + "' name='" + dbField + "'>" + (html_options.join('')) + "</select>"
  label = buildLabel(options.hash, dbField)
  return new Handlebars.SafeString(label + html);
});


Handlebars.registerHelper('check_box', function(field, options) {
  var capitalizedField, checked;
  if (!field) {
    return;
  }
  html_class = processClass(options.hash)
  checked = this[field] === 'true' ? ' checked' : '';
  label = processLabel(options.hash, field)
  html = "<label for='"+ field +"'><input id='"+ field +"' name='" + field + "' type='hidden' value='false'><input name='" + field + "' class='"+ html_class +"' type='checkbox' value='true' " + checked + ">" + label + "</label>";
  return new Handlebars.SafeString(html);
});

Handlebars.registerHelper('submit_button', function(text, options){
  var _this = this;
  if (text.hash) {
    options = text;
    text = undefined;
  }
  klass = _this.constructor.name;
  value = text || "Submit " + klass;
  html_class = processClass(options.hash);
  html_id = processId(options.hash);
  html = "<input type='submit' value='"+ value +"' class='btn "+ html_class +"'" + html_id + ">";
  return new Handlebars.SafeString(html);
});
