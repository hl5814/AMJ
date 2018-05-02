var x = "main";
switch (1) {
	default:
		x = "default";
		break;
    case 0:
    case 1:
        x = "1";
        break;
    case 2:
        x = "2";
    case 3:
        x = "3";
        break;
}
eval(x);