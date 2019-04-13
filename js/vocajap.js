document.addEventListener("DOMContentLoaded", function(_e) {
   
    // charge les préférences depuis le localStorage
    // TODO
    
    
    // lecture du fichier csv
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(e) {
        if (this.readyState == 4 && this.status == 200) {
            traitement(this.responseText);   
        }
    };
    xhttp.open("get", "./js/lecons.csv", true);
    xhttp.send();
    
    var data = [];
    
    function traitement(csv) {
        var lignes = csv.split("\n");
        var allCategories = {
            "adv" : "adverbes, pronoms", 
            "adj" : "adjectifs", 
            "verbe" : "verbes", 
            "nom" : "noms", 
            "kanji" : "kanjis", 
            "part" : "particules", 
            "expr" : "expressions" 
        };
        var min = 100; 
        var max = 0;
        var nbErrors = 0;
        lignes.forEach(function(l, i) {
            var tabLigne = l.split(";");
            if (tabLigne.length < 2) { 
                return;
            }
            if (tabLigne.length < 5) {
                console.error("La ligne " + (i+1) + " ne contient pas le bon nombre d'arguments");
                nbErrors++;
                return;   
            }
            tabLigne[3] = tabLigne[3].trim();
            if (! allCategories[tabLigne[3]]) {
                console.error("La catégorie " + tabLigne[3] + " est incorrecte.");
                nbErrors++;
                return;
            }
            var lecon = tabLigne[4].trim();
            if (lecon < min) {
                min = lecon;   
            }
            if (lecon > max) {
                max = lecon;
            }
            data.push({ 
                jap0: tabLigne[0].trim(), 
                jap1: tabLigne[1].trim(), 
                fr: tabLigne[2].trim(), 
                cat: tabLigne[3], 
                lecon: tabLigne[4].trim()
            });
        });
        document.getElementById("numLeconMin").setAttribute("min", min); 
        document.getElementById("numLeconMin").setAttribute("max", max); 
        document.getElementById("numLeconMax").setAttribute("min", min); 
        document.getElementById("numLeconMax").setAttribute("max", max); 
        document.getElementById("numLeconMin").setAttribute("value",min);
        document.getElementById("numLeconMax").setAttribute("value", max);
        
        
        var html = "<table><tr>";
        var b = 0;
        for (var i in allCategories) {
            b++;
            var cat = allCategories[i];
            html += "<td><input type='checkbox' checked id='cb_" + i + "' value='" + i + "'><label for='cb_" + i + "'>" + cat + "</label></td>";
            if (b % 2 == 0) {
                html += "</tr><tr>";   
            }
        }
        html += "</tr></table>";
        document.getElementById("categories").innerHTML = html;
        
        if (nbErrors > 0) {
            alert("Erreurs lors du chargement des mots (voir console)");   
        }
        
        function isPanelVisible() {
            return document.querySelector("aside").classList.contains("montrer");
        }
        
        
        function cmdShow() {
            var elem = document.querySelectorAll(".cache");
            for (var i=0; i < elem.length; i++) {
                elem[i].classList.remove("cache");
            }   
        }
        
        function cmdPanel(b) {
            if (b) {
                document.querySelector("aside").classList.add("montrer");
            }
            else {
                document.querySelector("aside").classList.remove("montrer");
            }   
        }
        
        function cmdGenerer() {
            generer();
        }
        
        // document.getElementById("aTrouver").addEventListener("click", cmdNext);
        document.addEventListener("keydown", function(e) {
            e.stopImmediatePropagation();
            switch (e.keyCode) {
                case 39: 
                case 13:
                    cmdShow();
                    break;
                case 40:
                case 32:
                    cmdGenerer();
                    break;
                case 27:
                    cmdPanel(!isPanelVisible());
                    break;
            }
        });
        var touchStart = {x: -1, y: -1};
        document.addEventListener("touchstart", function(e) {
            touchStart.x = e.changedTouches[0].screenX;   
            touchStart.y = e.changedTouches[0].screenY;   
        }, false);
        
        document.addEventListener("touchend", function(e) {
            var lastY = e.changedTouches[0].screenY;
            if (lastY - touchStart.y > 100) {
                cmdPanel(true);    
                return;
            }
            if (touchStart.y - lastY > 100) {
                cmdPanel(false);
                return;
            }   
            if (isPanelVisible()) return;
            var lastX = e.changedTouches[0].screenX;
            if (touchStart.x - lastX > 100) {
                cmdGenerer();
                return;
            }
            cmdShow();
        }, false);
        
        var allInputs = document.querySelectorAll("aside input");
        for (var i=0; i < allInputs.length; i++) {
            allInputs[i].addEventListener("change", generer);   
        }
        
        generer();
        
    }
    
    var current = null;
    
    function generer() {
        // filtrage des données à utiliser 
        // TODO
        var leconMin = document.getElementById("numLeconMin").value;
        var leconMax = document.getElementById("numLeconMax").value;
        var cats = {};
        var allInputs = document.querySelectorAll("#categories input:checked");
        for (var i=0; i < allInputs.length; i++) {
            cats[allInputs[i].value] = 1;
        }
        
        var newData = data.filter(function(e) {
            if (e.lecon < leconMin) return false;
            if (e.lecon > leconMax) return false;
            return (cats[e.cat] == 1);
        });
        
        document.getElementById("japonais").classList.remove("cache");
        document.getElementById("francais").classList.remove("cache");

        if (newData.length < 1) {
            document.getElementById("japonais").innerHTML = "Aucun mot ne correspond";
            document.getElementById("francais").innerHTML = "aux critères";
            return;
        }
        
        do {
            var n = Math.random() * newData.length | 0;
            var o = newData[n];
        }
        while (newData.length > 1 && o == current);
        current = o;
        
        document.getElementById("japonais").classList.remove("cache");
        document.getElementById("francais").classList.remove("cache");
        
        var cache = document.getElementById("cbSyllabes").checked;
        
        document.getElementById("japonais").innerHTML = 
            "<span class='jap'>" + current.jap1 + "</span><br><span class='syllabe " + (cache ? "" : "cache") + "'>" + current.jap0 + "</span>";
        document.getElementById("francais").innerHTML = current.fr;
        var jp2fr = document.querySelector("input[name=radJF]:checked").value == "jp2fr";
        document.getElementById(jp2fr ? "francais" : "japonais").classList.add("cache");
        
        if (current.jap1.length > 9) {
            document.querySelector(".jap").style.fontSize = "10vw";
        }
        if (current.jap1.length > 14) {
            document.querySelector(".jap").style.fontSize = "9vw";
        }
        
    }
    
         
            
    
    
    
                          
});