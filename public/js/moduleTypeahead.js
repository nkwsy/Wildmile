// typeahead script for module.pug tags attribute 

let tags = ['Plant', 'Plantain', 'Herbert'];
let tags = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.whitespace('name'),
    queryTokenizer: Bloodhound.tokenizers.whitespace, 
    local: tags
});
tags.initialize();

$('input').tagsinput({
    typeaheadjs: {
        name: 'tags',
        displayKey: 'name',
        valueKey: 'name',
        source: tags
    }
});

// Alternate typeahead script for module.pug tags attribute

// $(document).ready(function() {   
//     let tags = ['Plant', 'Plantain', 'Herbert'];
//     tags = new Bloodhound({ 
       //  datumTokenizer: Bloodhound.tokenizers.whitespace, 
//         queryTokenizer: Bloodhound.tokenizers.whitespace, 
//         local: tags
//     });
//     $('.typeahead').typeahead({
//         hint: true, 
//         highlight: true, 
//         minLength: 1
//     }, 
//     {
//         name: 'tags', 
//         source: tags
//     });
// });