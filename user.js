b = "test";
try  {
    eval(b);
    b = "TRY";
} catch(e) {
    eval(b);
    b = "CATCH";
} finally {
   eval(b);
   b = 0;
}
eval(b);