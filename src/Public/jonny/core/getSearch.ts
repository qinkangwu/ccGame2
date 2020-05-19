export var getSearch = function (keyword:string):string{
    let search:string = window.location.hash.replace(/#\/game\d{2}/,"");
    let regExp:RegExp = new RegExp(keyword+"=");
    let results:string[] = search.split("&");
    let _result = results[0];
    let result = _result.replace(regExp,"");
    if(/^\?/.test(result)){
        result = result.replace(/^\?/,"");
    }
    return result;
 }