export function validarCedula(cedula) {
  let c = cedula.split('');
  let v = [1,2,1,2,1,2,1,2,1,2];
  let result = 0;
  let ab, oc, dp, ac, uj;
  
  for (let i = 0; i < 10; i++){  
    let up = c[i] * v[i];
    ab = up;
    if ( ab >= 10 ) {
      oc = ab.toString()
        .split('')
        .map(x => parseInt(x) )
        .reduce( (x, y) => x + y);
    } else {
      oc = ab;
    }
    result = parseFloat(result) + parseFloat(oc);   
  }
  
  dp = result;
  ac = dp.toString().split('')[0] + '0';
  ac = parseInt(ac);
  uj = (ac / 10) * 10;
  
  if (uj < dp ) {
    dp = (uj + 10) - dp; 
  }   

  if (c[10] == dp) {             
    return true;
  } else {
    return false;
  }
}
