/*global Blob*/
/*global URL*/

(function() {
  return {
    events: {
      'app.created':'showTicketInfo',
      'click .saveSettings': 'showTicketInfo',
      'getTicketInfo.always': 'results',
      'getTicketInfo.fail': 'this.showError'
    },

    requests: {
      getTicketInfo: function(ticket_id){
        return {
          url: '/api/v2/tickets/' + ticket_id + '/audits.json',
          type: 'GET',
          dataType: 'json',
          success: function(data) {return data;}
        };
      }
    },



    results: function(data){
      var ip = data.audits[data.audits.length-1].metadata.system.ip_address;
      var local = data.audits[data.audits.length-1].metadata.system.location;
      var country = local.substring(local.lastIndexOf(',') + 2);
      console.log("IP Address: " + ip);
      console.log("Location: " + local);
      console.log("Country: " + country);
    },

    showTicketInfo: function(){
      var ticket_id = this.ticket().id();
      console.log("Ticket ID: " + ticket_id);
      this.ajax('getTicketInfo', ticket_id);
    },

     showError: function(){
       this.switchTo('error');
       console.log('showError is working');
     },

     makeTicketInfoRequest: function(){
       this.ajax('getTicketInfo', ticket_id);
     },

     showScore: function() {
       var sketchyEmails = [{
       "ip":"103.13.232.232","value":"CNC"
     },{
       "ip":"103.225.168.222","value":"CNC"
     },{
       "ip":"103.228.200.37","value":"CNC"
     }];

     var ticket = this.ticket();
     var ticket_id = ticket.id();

     userEmail = ticket.requester().email();
     console.log(ticket.requester());
     console.log(userEmail);

        if (this.$('#spamCheckbox').is(':checked')){
          if (userEmail in sketchyEmails){
            this.switchTo('spam');
          }

        }
        if (this.$('#torCheckbox').is(':checked')){
                  if (userEmail in sketchyEmails){
            this.switchTo('tor');
          }
        }
        if (this.$('#regionCheckbox').is(':checked')) {
          if (userEmail in sketchyEmails){
            this.switchTo('region');
          }
        }
     },

     printSuspendedUsers: function(){
       this.userIds = _.uniq(this.userIds);
       this.userIds.forEach(function(x){
         this.ajax('printSuspendedUsers', x);
       }, this);
     },

     concatPrint: function(data, ticket_id){
       var subdomain = this.currentAccount().subdomain();
       data = data.replace('/images/zendesk-lotus-flower.png', imagePath);
       this.tickets.push(data);
       if(this.userIds.length === this.users.length){
         this.createURL();
       }
     },
  };

}());


//This is the
