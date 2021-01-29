/* Global variable functions
 * These are up top to allow for quicker
 * changes, when a user decides to modify
 * what skills are available.
 */
//Returns a list of valid core stats
function global_cores(){
	return ([
		["intelligence", "int"], 
		["wisdom", "wis"], 
		["charisma", "cha"], 
		["constitution", "con"], 
		["strength", "str"], 
		["dexterity", "dex"]
	]);
}

//Returns a list of valid skills
function global_skills(){
	return  (["acro", "anihan", "arcana", "ath", "dec", "hist", "ins", "intim", "inv", "med", "nat", "perc", "perf", "pers", "rel", "soh", "ste", "surv"]);
}
//End global variable functions

(function(){
	if(window.addEventListener){
		window.addEventListener("DOMContentLoaded", page_loaded, false);
	}else{
		window.attachEvent('onload', page_loaded);
	}
}());

function page_loaded(){
	//Initialise Selectors for Input
	var input_cols = new Object();
	
	input_cols.uinputs = document.querySelectorAll(".ct-input").length;
	input_cols.mods = document.querySelectorAll(".ct-modout").length;
	input_cols.saves = document.querySelectorAll(".ct-saveout").length;
	input_cols.checks = document.querySelectorAll(".ct-chk").length;
	
	if(!check_count(input_cols) || (input_cols.uinputs < 1)){
		alert("Failed to align columns.");
		return;
	}
	
	document.addEventListener("click", update_stats);
	document.addEventListener("keydown", update_stats);
	document.addEventListener("keyup", update_stats);
	document.addEventListener("mousemove", update_stats);
	
	update_stats();
}

/* Generates stat objects from 
 * the passed array.
 */
function get_stats(arr){
	var out = new Object();
	var idx = "";
	
	for(var i = 0; i < arr.length; i++){
		idx = arr[i][1];
		out[idx] = new stat_obj(arr[i][0], arr[i][1]);
	}
	return out;
}

//Checks to make sure columns are aligned
function check_count(x){
	if(!(x.uinputs == x.mods) || 
		!(x.mods == x.saves) ||
		!(x.saves == x.checks) ||
		!(x.checks == x.uinputs)){
			return false;
	}
	return true;
}

/* Takes a string for the stat name, the user input field ID,
 * the modifier field ID, the saving throws field ID, and the
 * saving throw checkbox ID
 * 
 * Returns an object with these fields instantiated and
 * some object-level methods
 */
/* Creates an object to be used to store stat data
 */
function stat_obj(stat_name, prefix){
	this.name = String(stat_name);
	this.pf = String(prefix);
	
	this.inp_e = function(){return document.getElementById(this.pf + "-input");};
	this.mod_e = function(){return document.getElementById(this.pf + "-mod");};
	this.save_e = function(){return document.getElementById(this.pf + "-save");};
	this.prof_e = function(){return document.getElementById(this.pf + "-prof");};
	
	this.inp_v = this.inp_e().value;
	this.mod_v = this.mod_e().value;
	this.save_v = this.save_e().value;
	this.prof_v = this.prof_e().checked;
	
	this.mod_u = function(){this.mod_e().value = calc_mod(this.inp_e().value);};
	this.save_u = function(){this.save_e().value = ((this.prof_e().checked) ? (parseInt(this.mod_e().value) + get_prof()) : (parseInt(this.mod_e().value)));};
}

//Updates all the core stats
function update_stats(){
	var stats = get_stats(global_cores());
	
	for(var stat in stats){
		stats[stat].mod_u();
		stats[stat].save_u();
	}
	
	update_prof();
	update_skills();
}

/* Calculates the modifier for a skill
 * based on integer input.
 */
function calc_mod(x){
	var test = 2;
	var mod = -5;
	
	while(x > test - 1){
		test += 2;
		mod++;
	}
	return mod;
}

//Updates proficiency bonus
function update_prof(){
	var pf = document.getElementById("char-prof");
	pf.value = get_prof();
}

//Gets proficiency bonus
function get_prof(){
	var bonus = document.getElementById("char-level").value;
	return calc_prof(bonus);
}

/* Calculates the proficiency
 * bonus for a player, based on their
 * character level.
 * 
 * To allow higher proficiency, uncomment the
 * first return statement, and comment the second
 * out. This was removed,
 * because D&D doesn't support more than a
 * +6 bonus.
 */
function calc_prof(x){
	var test = 4;
	var mod = 2;
	
	while(x > test){
		test += 4;
		mod++;
	}
	//return mod;
	return ((mod > 6) ? 6 : mod);
}

/* Calculates the bonuses for secondary
 * skills, based on proficiencies and the
 * stat modifiers for their core stat.
 */
function update_skills(){
	var skills = new get_skills(global_skills());
	
	for(var skill in skills){
		skills[skill].outp_u();
	}
}

/* Get a list of skills as elements
 */
function get_skills(arr){
	var name = "";
	for(var i = 0; i < arr.length; i++){
		name = String(arr[i]);
		this[name] = new gen_skill(name);
	}
}

/* Create a skill and its associated functions.
 */
function gen_skill(prefix){
	this.pf = String(prefix);
	
	this.outp = function(){return document.getElementById(this.pf + "-out");};
	this.name_in = function(){return document.getElementById(this.pf + "-name");};
	this.modby = function(){return document.getElementById(this.pf + "-modby");};
	this.prof = function(){return document.getElementById(this.pf + "-prof");};
	
	this.name_v = this.name_in().value;
	this.modby_v = this.modby().value;
	this.prof_ck = this.prof().checked;
	
	this.outp_u = function(){this.outp().value = get_skbonus(this.modby().value, this.prof().checked);};
}

/* Determine how much bonus to give to a specific
 * skill check.
 */
function get_skbonus(modifier, proficiency=false){
	var mod = String(modifier).toLowerCase();
	var stats = get_stats(global_cores());
	var out = 0;
	
	for(var stat in stats){
		if(stats[stat].pf == mod){
			out = (parseInt(stats[stat].mod_v) + ((proficiency) ? get_prof() : 0));
			break;
		}
	}
	return out;
}
