/**
 * A few functions to be used internally in the solar system.
 */
(function (solar, undefined) {
	"use strict";

	/**
	 * Converts a string or number into its naturally-reading counterpart.
	 * For example, "length_of_year" is translated to "Length of Year".
	 * 20153.953 is translated to 20,153.953.
	 * @param   {String} string String to parse
	 * @returns {String} Parsed string.
	 */
	function toNaturalLanguage(string) {
		string = "" + string.toLowerCase();
		var lowercase = ["of", "a", "to"];
		var i, len;

		if (string) {
			//Is it a number?
			if (parseInt(string) == string) {
				if (parseInt(string) >= 10000) {
					string = string.split("");
					//Add commas
					for (i = string.length - 1; i >= 0; i -= 3) {
						if (i < string.length - 1)
							string[i] = string[i] + ",";
					}
					string = string.join("");
				}
			} else {
				//Capitalize first letter
				string = string.split("");
				string[0] = string[0].toUpperCase();

				//Split underscores into spaces
				for (i = 0, len = string.length; i < len; i++) {
					if (string[i] == "_") {
						string[i] = " ";
						if (string[i + 1]) {
							string[i + 1] = string[i + 1].toUpperCase();
						}
					}
				}

				string = string.join("");

				//Lowercase replacements
				for (i = 0, len = lowercase.length; i < len; i++) {
					var expr = new RegExp(lowercase[i], "gi");
					string = string.replace(expr, lowercase[i]);
				}
			}
		}
		return string;
	}

}(window.solar = window.solar || {}));