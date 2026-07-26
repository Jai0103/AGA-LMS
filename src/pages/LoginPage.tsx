Small LoginPage change

Open this file:

src/pages/LoginPage.tsx

Find the place near the login form where you show links such as Register or Create account.

Add this link:

<Link to="/forgot-password" className="text-sm font-bold text-slate-700 hover:text-slate-950">
  Forgot password?
</Link>

If LoginPage.tsx does not already import Link, add:

import { Link } from "react-router-dom";

Testing:

1. Open:

https://jai0103.github.io/AGA-LMS/#/login

2. Confirm Forgot password? appears.
3. Click it.
4. Confirm it opens:

https://jai0103.github.io/AGA-LMS/#/forgot-password
