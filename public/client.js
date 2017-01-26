var nominationIDs = [];
var senatorIDs = [];
var nominations = {};
var senators = {};
var votesBySenator = {};

// govtrack api calls blatantly stolen from https://cabinet.bjacobel.com/
function loadEverything() {
  $.getJSON(
    "https://www.govtrack.us/api/v2/vote/",
    {
      "congress": "115",
      "chamber": "senate",
      "session": "2017"
    }
  ).done(r => {
    parseVoteResponse(r);
    var reqs = nominationIDs.map(n => 
      $.getJSON(
        "https://www.govtrack.us/api/v2/vote_voter",
        {"vote": n}
      ).done(parseRollCallResponse)
    );
    $.when(...reqs).then(votes => {
      senatorIDs.sort((a, b) => senators[a].sortname.localeCompare(senators[b].sortname));
      buildTable();
    })
  });
}

function parseVoteResponse(voteResponse) {
  voteResponse.objects.filter(
    v => v.category === "nomination"
  ).forEach(n => {
    n.name = /: (.*), of/.exec(n.question)[1]
    n.position = /to be (?:the )?([^,]*)/.exec(n.question)[1]
      .replace("of the United States of America ", "");
    nominations[n.id] = n;
    nominationIDs.push(n.id);
  });
}

function parseRollCallResponse(rollCallResponse) {
  var vs = rollCallResponse.objects;
  vs.forEach(v => {
    if (!senators.hasOwnProperty(v.person.id)) {
      v.person.role = v.person_role;
      var match = / \[(.)-(..)\]/.exec(v.person.name);
      v.person.party = match[1];
      v.person.state = match[2];
      senators[v.person.id] = v.person;
      senatorIDs.push(v.person.id)
      votesBySenator[v.person.id] = {};
    }
    votesBySenator[v.person.id][v.vote.id] = v;
  })
}

function buildTable() {
  var header = document.getElementById("column-headers");
  nominationIDs.forEach(n => {
    var nominee = document.createElement("th");
    nominee.appendChild(document.createTextNode(nominations[n].name));
    var position = document.createElement("span");
    position.className = "position";
    position.appendChild(document.createTextNode(nominations[n].position));
    nominee.appendChild(position);
    header.appendChild(nominee);
  });
  var body = document.getElementById("body");
  senatorIDs.forEach(sID => {
    var senator = senators[sID];
    var row = document.createElement("tr");
    row.className = "party-" + senator.party + " state-" + senator.state + " senator-" + senator.id;
    var name = document.createElement("th");
    name.appendChild(document.createTextNode(senator.name));
    var tel = document.createElement("a");
    tel.href = "tel:" + senator.role.phone;
    tel.appendChild(document.createTextNode(senator.role.phone));
    name.appendChild(tel);
    row.appendChild(name);
    nominationIDs.forEach(nID => {
      var cell = document.createElement("td");
      var vote = votesBySenator[sID][nID].option.value;
      cell.className = "vote-" + vote.replace(" ", "");
      cell.appendChild(document.createTextNode(vote));
      row.appendChild(cell);
    });
    body.appendChild(row);
  })
}

loadEverything();