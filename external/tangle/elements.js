
Tangle.classes.DraggableNumber = {
	initialize: function(element, options, tangle, variable) {
		element.type = 'number';
		element.addEventListener('input', function() {
			tangle.setValue(variable, Number(this.value));
		});
	},
	update: function(element, value) {
		element.value = value;
	},
};


Tangle.classes.Checkbox = {
	initialize: function(element, options, tangle, variable) {
		element.type = 'checkbox';
		element.addEventListener('input', function() {
			tangle.setValue(variable, Boolean(this.checked));
		});
	},
	update: function(element, value) {
		element.checked = value;
	},
};
