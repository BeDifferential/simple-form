Package.describe({
  summary: "A meteorite package that makes building dynamic two way forms easy",
  version: "0.1.8",
  git: "https://github.com/Differential/simple-form.git"
});

Package.on_use(function(api) {
  api.versionsFrom("METEOR@0.9.0");
  api.use(['ui', 'templating', 'underscore', "mrt:underscore-string-latest@2.3.3"], 'client');
  api.add_files(['fileField.html', 'fileField.js', 'helper.js', 'simpleform.js'], 'client');
  api.export('SimpleForm', 'client');
});
