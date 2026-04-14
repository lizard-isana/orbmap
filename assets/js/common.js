document.addEventListener('DOMContentLoaded', function () {

  var code = document.querySelectorAll("code");
  for(let i=0,ln=code.length;i<ln;i++){
    const source = code[i].innerHTML;
    code[i].innerHTML = source.trim().replaceAll("<","&lt;").replaceAll(">","&gt;")
  }
  hljs.configure({
    tabReplace: '  ' 
  });
  hljs.addPlugin({
    'after:highlightElement': ({ el, result}) => {
      el.innerHTML = result.value.replace(/^/gm,'<span class="row-number"></span>');
    }
  });

})