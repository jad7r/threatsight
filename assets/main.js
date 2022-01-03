//This app is based on the default app tutorial
//https://develop.zendesk.com/hc/en-us/articles/360001074868
//intialization function.  use this to call the functions defined below.

$(function() {
  var client = ZAFClient.init();
  client.invoke('resize', { width: '100%', height: '600px' });
  //showListOptions(client)

 client.get('user.id').then(
    function(data) {
      var user_id = data['user.id'];
         requestUserInfo(client, user_id);
         downloadThreatIntel(client);
    }
  );


  client.get('ticket.requester.id').then(
    function(data) {
      var user_id = data['ticket.requester.id'];
      requestUserInfo(client, user_id);
    }
  );

 client.get('ticket.id').then(
    function(data) {
      var ticket_id = data['ticket.id'];
      requestTicketInfo(client, ticket_id);
    }
  );




});


// requestUserInfo on the currently displayed ticket
function requestUserInfo(client, id) {
  var settings = {
    url: '/api/v2/users/' + id + '.json',
    type:'GET',
    dataType: 'json',
  };
  client.request(settings).then(
    function(data) {
      showInfo(data,client);
    },
    function(response) {
      showError(response);
    }
  );
}

//send the results back to the web form
function showInfo(data,client) {
  var requester_data = {
    'name': data.user.name,
    'email': data.user.email,
    'tags': data.user.tags,
    'created_at': formatDate(data.user.created_at),
    'last_login_at': formatDate(data.user.last_login_at)
  };
  var email = data.user.email;
  ThreatScoreEmailAddress(data,client);
  var source = $("#requester-template").html();
  var template = Handlebars.compile(source);
  var html = template(requester_data);
  $("#content").html(html);
}


//show error if error condition
function showError(response) {
  var error_data = {
    'status': response.status,
    'statusText': response.statusText
  };
  var source = $("#error-template").html();
  var template = Handlebars.compile(source);
  var html = template(error_data);
  $("#content").html(html);
}

//get date into a usable form
function formatDate(date) {
  var cdate = new Date(date);
  var options = {
    year: "numeric",
    month: "short",
    day: "numeric"
  };
  date = cdate.toLocaleDateString("en-us", options);
  return date;
}

//request the IP address, location and Browser metadata from the api/v2 audits json
function requestTicketInfo(client, ticket_id){
    var settings = {
    url: '/api/v2/tickets/' + ticket_id + '/audits.json',
    type:'GET',
    dataType: 'json',
  };
   //console.log(ticket_id)

  client.request(settings).then(
    function(data) {
           showTicketInfo(data);
           ThreatScoreIPAddress(data,client);
    },
    function(response) {
      showError(response);
    }
  );
}

//download a threat list and check ip against the list
function downloadThreatIntel(client) {
    console.log("Made it to ThreatIntel Downloading" + ip);
    var score = "GREEN";
    var url = "https://www.binarydefense.com/banlist.txt";
    //var url="https://rules.emergingthreats.net/fwrules/emerging-Block-IPs.txt";
    var settings = {
        url: url,
        headers: { "Access-Control-Allow-Origin": "*" },
        type: 'GET',
        dataType: 'text',
        async: 'false',
    };
    client.request(settings).then(
        function (data) {
            //return data;
            //console.log("using ZAT to make the request");
            //console.log(data);
            var threatlistrawdata = (data);
            splitdataarray = threatlistrawdata.split("\n");
            for (var i = 0; i < splitdataarray.length; i++) {
                console.log("Comparing two values " + splitdataarray[i] + " and " + ip);
                if (splitdataarray[i] === ip) {
                    console.log("MATCHED!!!" + splitdataarray[i] + " and " + ip);
                    score = 'RED: Emerging Threats List';
                    showThreatScore(data, score);
                    return score;
                }
            }
        },
        function (response) {
            console.log(response);
        }
    );
}




//download a threat list and check ip against the list
function ThreatScoreIPAddress(data,client) {
    var ip = data.audits[0].metadata.system.ip_address;
    console.log("Made it to ThreatScoring" + ip);
    var score="GREEN";
    var url = "https://www.binarydefense.com/banlist.txt";
    //var url="https://rules.emergingthreats.net/fwrules/emerging-Block-IPs.txt";
    var settings = {
        url: url,
        headers: {"Access-Control-Allow-Origin": "*"},
        type: 'GET',
        dataType: 'text',
        async: 'false',
  };
  client.request(settings).then(
    function(data) {
        //return data;
        //console.log("using ZAT to make the request");
        //console.log(data);
        var threatlistrawdata = (data);
        splitdataarray = threatlistrawdata.split("\n");
        for (var i = 0; i < splitdataarray.length; i++) {
            console.log("Comparing two values " + splitdataarray[i] + " and " + ip);
            if (splitdataarray[i] === ip) {
                console.log("MATCHED!!!" + splitdataarray[i] + " and " + ip);
                score = 'RED: Emerging Threats List';
                showThreatScore(data,score);
                return score;
            }
        }
    },
    function(response) {
      console.log(response);
    }
  );
   showThreatScore(data,score);
}

//download an Email threat list and check email address against the list
function ThreatScoreEmailAddress(data,client) {
    var email = data.user.email;
    console.log("Made it to Email Threat Scoring " + email)
    var score="GREEN";
    var url = "https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/master/disposable_email_blocklist.conf"
    //var url = "https://raw.githubusercontent.com/WSTNPHX/scripts-n-tools/master/malware-email-addresses.txt"
    var settings = {
        url: url,
        headers: {"Access-Control-Allow-Origin": "*"},
        type: 'GET',
        dataType: 'text',
        async: 'false',
  };
  client.request(settings).then(
    function(data) {
        //return data;
        //console.log("using ZAT to make the request");
        //console.log(data);
        var threatlistrawdata = (data);
        splitdataarray = threatlistrawdata.split("\n");
        //splitdataarray[1] = 'mail.ru';
        //splitdataarray[18] = 'alaminhossen0266@gmail.com';
        for (var i = 0; i < splitdataarray.length; i++) {
            domain = email.split("@");
            console.log("Comparing two values " + splitdataarray[i] + " and " + email + " domain " + domain);
            domain = email.split("@");
	    if (domain[1] === splitdataarray[i]) {
                console.log("MATCHED!!!" + splitdataarray[i] + " and " + email);
                score = 'RED: Phishing Threat Detected';
                showEmailThreatScore(data,score);
                return score;
            }
        }
    },
    function(response) {
      console.log(response);
    }
  );
   showEmailThreatScore(data,score);
}


//display the Metadata gathered from the audits json and the threat score
function showTicketInfo(data,score) {
  var ticket_data = {
    'metadata': data,
    'browser': data.audits[0].metadata.system.client,
    'ip': data.audits[0].metadata.system.ip_address,
    'location': data.audits[0].metadata.system.location,
    'latitude': data.audits[0].metadata.system.latitude,
    'longitude': data.audits[0].metadata.system.longitude,
  };
  //console.log("Here is the threatscore " + score);
  var ip = data.audits[data.audits.length-1].metadata.system.ip_address;
  var source = $("#ticket-info").html();
  var template = Handlebars.compile(source);
  var html = template(ticket_data);
  $("#content2").html(html);
}

function showThreatScore(data,score) {
  var ticket_data = {
      'score':score,
  };
  var source = $("#threat-scoring").html();
  var template = Handlebars.compile(source);
  var html = template(ticket_data);
  $("#content3").html(html);
}

function showEmailThreatScore(data,score) {
  var ticket_data = {
      'score':score,
  };
  var source = $("#email-threat-scoring").html();
  var template = Handlebars.compile(source);
  var html = template(ticket_data);
  $("#content4").html(html);
}


//Scratch area where I am debugging the Threat Lists and writing output to console.

//work to download the binary alert ban list
//https://www.binarydefense.com/banlist.txt
//https://rules.emergingthreats.net/fwrules/emerging-Block-IPs.txt
//https://cors-anywhere.herokuapp.com/https://www.binarydefense.com/banlist.txt",

function checkDownload() {
   var settings = {
  url: 'https://rules.emergingthreats.net/fwrules/emerging-Block-IPs.txt',
  headers: {"Access-Control-Allow-Origin": "*"},
  secure: true,
  type: 'GET',
  dateType: 'text'
};
var client = ZAFClient.init();
client.request(settings).then(
  function(data) {
    //console.log(data);
  },
  function(response) {
    //console.log(response);
  }
);

}

