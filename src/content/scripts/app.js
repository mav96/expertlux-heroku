var ga = window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments);};ga.l=+new Date;
ga('create', 'UA-44273294-3', 'auto', 'elt');
ga('elt.send', 'pageview');

window.onerror = function (error, url, line) {
    ga('send', 'exception', {
        exDescription: line + ' ' + error
    });
};

ga(function(tracker, options) {
    // Logs the tracker created above to the console.
    window.console.log(ga.getAll(), tracker, options);
});

function $(selector, context) {
    return Array.from((context || document).querySelectorAll(selector));
}

try {
    $('form').forEach(function(form){
        form.addEventListener('submit', function(event){
            event.preventDefault();

            var elements = $('input', this);//Array.from(form.elements);
            var hasEmpty = elements.some(function(element){
                return element.value == '';
            });
            if(hasEmpty) return;
  
            var json = {};
            elements.forEach(function(element){
                json[element.name] = element.value;
                element.value = '';
            });

            var req = new XMLHttpRequest();     
            req.open (form.method, form.action, true);
            req.setRequestHeader('Content-Type', 'application/json');//; charset=UTF-8
            req.onload = function(){ 
                ga('send', 'event', json.type, 'submit');
                window.console.log(req.responseText);
            };
            req.send(JSON.stringify(json));
        });
    });
} catch (exception) {
    ga('send', 'exception', {
        exDescription: exception.message,
        exFatal: false
    });
}