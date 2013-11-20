var sentiment = require('sentiment'),
	csv = require('csv');

exports.refine = function(req, res){
	refineCSV(function(s) {
		res.render('refine', { title: 'Parseville - Refine Station', result: s});
	});
};

function refineCSV(callback) {
	csv()
		.from.path(__dirname+'/../input.csv')
		.transform(function(row, index) {
			var newRow = [],
				response = row[2];
			//remove white space (we know this is populated)
			row[2] = row[2].replace(/^\s\s*/, '').replace(/\s\s*$/, '');
			//if there is a second one
			if(row[3].length > 0) {
				//remove whitespace
				row[3] = row[3].replace(/^\s\s*/, '').replace(/\s\s*$/, '');
				//combine 2 and 3 (the 2 responses) with a splitter \n
				response = row[2] + '\\n' + row[3];
			}
			parseThis(response, function(sent) {
				newRow.push(sent.score);
				newRow.push(row[4] + row[5]);
			});

			for(var r = 0; r < row.length; r++) {
				if(r !==2 && r!==3) {
					newRow.push(row[r]);
				}
				if(r===2) {
					newRow.push(response);
				}
			}
			return newRow;
		})
		.to(__dirname+'/../output.csv');

	callback(true);
}

function parseThis(response, callback) {
	sentiment(response, function (err, result) {
		// console.log(result);
		callback(result);
	});
}

//deprecated
function sentimentCSV(callback) {
	csv()
		.from.path(__dirname+'/../input.csv')
		.transform(function(row, index) {
			//this is the response
			//only parse it for sentiment if there is something!
			if(row[2].length > 0) {
				parseThis(row[2], function(sent) {
					row.push(sent.score);
					row.push(sent.comparative);
				});
			}
			return row;
		})
		.to(__dirname+'/../output.csv');

	callback(true);
}

//deprecated
exports.sentiment = function(req, res){
	//don't use 
	sentimentCSV(function(s) {
		res.render('sentiment', { title: 'Parseville - Sentiment Corner', result: s});
	});
};