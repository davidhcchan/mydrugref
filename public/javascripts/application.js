var SearchDiv = {
  enterMeansSearch: function(event){
    if (event.keyCode == Event.KEY_RETURN) {
        $('search_button').click();
        return false;
    }
    else {
        return true;
    }
  },
  
  searchForResults: function(by){
    $('spinner').show();
    new Ajax.Updater(
      'results', '/posts/get_results', {
        asynchronous:true, evalScripts:true, onSuccess:function(request){$('spinner').hide()},
        parameters: 'by=' + by + '&' + getAtcs() + 'drugtext=' + $F('drugtext')
      }
    );
  },
  
  getPricesResults: function(by){
    if (by == 'brandname'){
      var url = '/prices/get_results_by_brand';
    }
    else {
      var url = '/prices/get_results_by_ingredient';
    }
    $('spinner').show();
    new Ajax.Updater(
      'results', url, {
        asynchronous:true, evalScripts:true, onSuccess:function(request){$('spinner').hide()},
        parameters: 'drugtext=' + $F('drugtext')
      }
    );
  },

  byBrandName: function(){
    $('searching_by').update('Brand Name');
    $('alt_search_link').update(
      '<a href="#" onclick="SearchDiv.byIngredient(); return false;">Search By Active Ingredient (Generic Name)</a>'
      );
    $('search_button').replace(
    '<input id="search_button" type="button" value="Search" onclick="SearchDiv.searchForResults(\'brandname\');"/>'
    );
  },
  
  byIngredient: function(){
    $('searching_by').update('Active Ingredient (Generic Name)');
    $('alt_search_link').update(
      '<a href="#" onclick="SearchDiv.byBrandName(); return false;">Search By Brand Name</a>'
      );
    $('search_button').replace(
    '<input id="search_button" type="button" value="Search" onclick="SearchDiv.searchForResults(\'ingredient\');"/>'
    );
  },
  
  priceByIngredient: function(){
    $('searching_by').update('Active Ingredient (Generic Name)');
    $('alt_search_link').update(
      '<a href="#" onclick="SearchDiv.priceByBrandName(); return false;">Search By Brand Name</a>'
      );
    $('search_button').replace(
    '<input id="search_button" type="button" value="Search" onclick="SearchDiv.getPricesResults(\'ingredient\');"/>'
    );
  },
  
  priceByBrandName: function(){
    $('searching_by').update('Brand Name');
    $('alt_search_link').update(
      '<a href="#" onclick="SearchDiv.priceByIngredient(); return false;">' + 
      'Search By Active Ingredient (Generic Name)</a>'
      );
    $('search_button').replace(
    '<input id="search_button" type="button" value="Search" onclick="SearchDiv.getPricesResults(\'brandname\');"/>'
    );
  }
  
}

var ResultDiv = {
  lightUp: function(div){
    if (div.hasClassName('result')){
      div.removeClassName('result');
      div.addClassName('add');
      new Insertion.Bottom(div, '<p>Add to post</p>');
    }
  },
  backToNorm: function(div){
    if(div.hasClassName('add')){
      div.removeClassName('add');
      div.addClassName('result');
      div.down('p').remove();
    }
  },
  makeItGrey: function(div){
    div.removeClassName('add');
    div.onclick = '';
    div.addClassName('added');
    div.down('p').update('Added to post');
  },
  add: function(div){
    ResultDiv.makeItGrey(div);
    var controller = $('controller_name').readAttribute('class');
    var params = 'atc_code=' + div.down('span#atc_code').innerHTML;
    params += '&atc_class=' + div.down('span#atc_class').innerHTML + '&con_name=' + controller;
    new Ajax.Updater($('post_drug_refs'), '/posts/add_post_atc', {insertion: Insertion.Bottom, parameters: params });
  },
  addToPrice: function(div){
    var results = div.up('#results');
    results.update(div);
    results.insert('Price can only be attached to one drug.');
    var search_div = results.up('.search');
    var drug_input = search_div.down('#drugtext');
    drug_input.writeAttribute('readonly', 'readonly');
    drug_input.value = '';
    search_div.down('#search_button').writeAttribute('onclick', '');
    search_div.down('#alt_search_link').update();
    ResultDiv.makeItGrey(div);
    var params = 'brand_name=' + div.down('span#brand_name').innerHTML + 
    '&atc_code=' + div.down('span#price_atc').innerHTML +'&din=' + div.down('span#din').innerHTML.slice(1, -1);
    new Ajax.Updater($('post_drug_refs'), '/prices/add_price_drug', 
                     {insertion: Insertion.Bottom, parameters: params });
  }
}

var PostForm = {
  deleteDrugRef: function(li, id) {
    li.hide();
    new Insertion.Bottom(li, 
      '<input id="post_drug_refs_attributes_' + id + '__delete" type="hidden" name="post[drug_refs_attributes][' + 
      id + '][_delete]" value="1"/>'
    );
  },
  removeNewPriceDrug: function(div) {
    div.remove();
    // make search possible again:
    $('results').update();
    $('drugtext').removeAttribute('readonly');
    $('search_button').writeAttribute('onclick', 'SearchDiv.getPricesResults("brandname")');
    $('alt_search_link').update(
      '<a href="#" onclick="SearchDiv.priceByIngredient(); return false;">Search By Active Ingredient ' +
      '(Generic Name)</a>');
    $('searching_by').update('Brand Name');
  },
  deletePriceDrugRef: function(li, id) {
    li.hide();
    new Insertion.Bottom(li, 
      '<input id="post_drug_refs_attributes_' + id + '__delete" type="hidden" name="post[drug_refs_attributes][' + 
      id + '][_delete]" value="1"/>'
    );
    $('results').update();
    $('drugtext').removeAttribute('readonly');
    $('search_button').writeAttribute('onclick', 'SearchDiv.getPricesResults("brandname")');
    $('alt_search_link').update(
      '<a href="#" onclick="SearchDiv.priceByIngredient(); return false;">Search By Active Ingredient ' +
      '(Generic Name)</a>');
  },
  toggle: function() {
    var container = $('form_container');
    var form = $$('#form_container form').first();
    if(container.hasClassName('active')) {
      form.visualEffect('blind_up', { duration: 0.25, afterFinish: function(){
        container.removeClassName('active');
      }});
    } else {
      form.visualEffect('blind_down', { duration: 0.5, beforeStart: function(){
        container.addClassName('active');
      }});
    }
  }
}

var TDPostForm = {
  toggle: function(itemid) {
    var container = $$('#'+itemid+' div').first();
    var form = $$('#'+itemid+' form').first();
    if(container.hasClassName('active')) {
      form.visualEffect('blind_up', { duration: 0.25, afterFinish: function(){
        container.removeClassName('active');
      }});
    } else {
      form.visualEffect('blind_down', { duration: 0.5, beforeStart: function(){
        container.addClassName('active');
      }});
    }
  }
}

var EditTDPostForm = {
  toggle: function(itemid) {
    var container = $$('#edit'+itemid+' div').first();
    var form = $$('#edit'+itemid+' form').first();
    if(container.hasClassName('active')) {
      form.visualEffect('blind_up', { duration: 0.25, afterFinish: function(){
        container.removeClassName('active');
      }});
    } else {
      form.visualEffect('blind_down', { duration: 0.5, beforeStart: function(){
        container.addClassName('active');
      }});
    }
  }
}

function getAtcs(){
    var postAtcs = $$('#post_drug_refs li');
    var atcCodes = '';
    for (var i=0; i<postAtcs.length; i++){
      //atcCodes.push(postAtcs[i].down('.atc_code').innerHTML);
      atcCodes += 'atcs[]=' + postAtcs[i].down('.atc_code').innerHTML + '&'
    }
    return atcCodes;
  }
  
