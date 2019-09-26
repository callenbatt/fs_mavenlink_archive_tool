function runArchiveWorkspaces() {
    new ArchiveWorkspaces();
}

var ArchiveWorkspaces = function() {
    this.sheet = SpreadsheetApp.openById(SSID).getSheetByName('workspaces');
    this.sheet_values = this.sheet.getDataRange().getValues();
    this.sheet_keys = this.sheet_values.splice(0, 1)[0];

    this.index_id = this.sheet_keys.indexOf('id');
    this.index_status = this.sheet_keys.indexOf('status');
    this.index_archive = this.sheet_keys.indexOf('archived');

    this.output_status = [];
    this.output_archive = [];

    for (var i = 0; i < this.sheet_values.length; i++) {
        var id = this.sheet_values[i][this.index_id].toString();
        this.output_status.push([this.updateStatus(id)]);
        this.output_archive.push([this.updateArchive(id)]);
    }

    this.sheet.getRange(2, this.index_status +1, this.output_status.length, 1).setValues(this.output_status);
    this.sheet.getRange(2, this.index_archive +1, this.output_archive.length, 1).setValues(this.output_archive);
}

ArchiveWorkspaces.prototype.updateStatus = function(id) {
    var payload = {
        "workspace_status_change": {
            "workspace_id": id,
            "to_status_key": "605"
        }
    }
    Logger.log(payload);
    var options = {
        'method' : 'post',
        'contentType': 'application/json',
        'payload' : JSON.stringify(payload),
        'headers' : {
            'Authorization' : 'Bearer ' + API_TOKEN
        }
    }
    var url = 'https://api.mavenlink.com/api/v1/workspace_status_changes';

    try {
        UrlFetchApp.fetch(url, options);
        return "completed"
    }
    catch(e) {
      var error = JSON.stringify(e);
      if (error.indexOf("Project already has specified status") > 0) {
        return "set";
      }
      else {
        return "error: " + error
      }
    }
}

ArchiveWorkspaces.prototype.updateArchive = function(id) {
    var payload =  {
        "workspace": {
            "archived": true
        }
    };
    var options = {
        'method' : 'put',
        'contentType': 'application/json',
        'payload' : JSON.stringify(payload),
        'headers' : {
            'Authorization' : 'Bearer ' + API_TOKEN
        }
    }
    var url = 'https://api.mavenlink.com/api/v1/workspaces/' + id;

    try {
        UrlFetchApp.fetch(url, options);
        return "archived"
    }
    catch(e) {
        return "error: " + e
    }
}