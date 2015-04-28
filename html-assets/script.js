(function() {
    
    var has_data = false;
    var max_runes = document.getElementsByTagName("rect").length;
    var init_delay = 100;
    var picked = 0;
    var question = "A Question.";
    var refer_uri = "";
    var rune_bag = document.getElementById("rune-bag");
    var runes = [];  // [[rune.id, inverted: true|false], ...]
    var self = location.protocol + "//" + location.host + location.pathname;
    
    function init() {
        // Called under normal circumstances, when there is no data suppied.
        if (picked < document.getElementsByTagName("rect").length) {
            picked += 1;
            pick_a_rune();
            setTimeout(init, init_delay);
        } else {
            finish_init();
        }
    }
    
    function compose_share_link() {
        var p = self + "?runes=";
        var r = [];
        for (var i=0; i<runes.length; i++) {
            r.push(String(runes[i][0]) + "." + ((runes[i][1]) ? "1" : "0"));
        }
        p += r.join(",") + "&question=" + encodeURIComponent(question);
        console.log(p);
        return p;
    }
    
    function compose_reflection(rune_id, inverted) {
        var p = document.getElementById("content-" + picked);
        var intro = p.innerHTML;
        var src_id = "source-" + rune_id;
        var rune = "We've drawn <strong>" + rune_id.toUpperCase();
        if (inverted) rune += " inverted";
        rune += "</strong>.";
        var s = document.getElementById(src_id);
        var reflection = s.innerHTML;
        if (inverted) {
            var si = document.getElementById(src_id + "-inverted");
            if (si) reflection += " " + si.innerHTML;
        }
        p.innerHTML = intro + " " + rune + " " + reflection;
    }
    
    function finish_init() {
        if (!has_data) {
            var u = compose_share_link();
            location.replace(u);
        } else {
            var t = document.getElementById("composed-title");
            var c = document.getElementById("composed-content");
            var s = document.getElementById("asker");
            t.firstChild.nodeValue = question;
            c.style["display"] = "block";
            s.href = self;
        }
    }
    
    function parse_args() {
        // Get the arguments part of the location.
        var l = location.href.split(location.pathname);
        if (l.length != 2) return false;
        var a = l[1].substring(1).split("&");
        for (var i=0; i<a.length; i++) {
            var kv = a[i].split("=");
            if (kv[0] == "question") {
                question = decodeURIComponent(kv[1]);
                question = question.replace(/\+/g, " ");
            }
            if (kv[0] == "runes") {
                var rs = decodeURIComponent(kv[1]).split(",");
                if (rs.length != max_runes) return false;
                for (var j=0; j<rs.length; j++) {
                    /* We want a float-like expression where in x.y,
                       x is a rune's id and y is either 0 or 1, which
                       we'll then convert to a Boolean. */
                    var r_ids = rs[j].split(".");
                    if (isNaN(r_ids[0])) return false;
                    if (r_ids.length != 2) r_ids[1] = "0";
                    if (isNaN(r_ids[1])) return false;
                    runes.push([Number(r_ids[0]), Boolean(Number(r_ids[1]))]);
                }
            }
        }
        // Because we can get to this point and still not have the right number.
        if (!question) question = "...";
        if (runes.length != max_runes) {
            runes = [];
            return false;
        }
        return true;
    }
    
    function pick_a_rune() {
        var choices = rune_bag.children;
        var rune_field = document.getElementById("rune-" + picked);
        if (has_data) {
            var choice = runes[picked-1][0];
            var rune = choices[choice];
            var inverted = runes[picked-1][1];
        } else {
            var choice = Math.floor(Math.random() * choices.length);
            var rune = choices[choice];
            var inverted = false;
            if (rune.hasAttribute("reversible")) inverted = Math.random() >= 0.5;
            runes.push([choice, inverted]);
        }
        if (inverted) rune_invert(rune);
        compose_reflection(rune.id, inverted);
        rune_field.appendChild(rune);
    }
    
    function rune_invert(rune) {
        var scale = "scale(-1,-1)";
        var translate = "translate(-" + rune_bag.attributes["width"].value +
            ",-" + rune_bag.attributes["height"].value + ")";
        rune.setAttribute("transform", [scale, translate].join(" "));
    }
    
    // Here we go.
    has_data = parse_args();
    if (!has_data) {
        question = prompt("Think of a title of a situation:");
        init_delay = 0;
        var g = document.getElementById("rune-field");
        g.style["display"] = "none";
    }
    setTimeout(init, init_delay);
    
}).call();
