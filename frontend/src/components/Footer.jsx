import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer  className="bg-surface-container-lowest w-full py-10 flat no shadows">

<div className="grid grid-cols-1 md:grid-cols-5 gap-6 max-w-[1280px] mx-auto px-4 md:px-12">
<div className="col-span-1 md:col-span-2 space-y-4">
<div className="font-headline-md text-headline-md text-primary flex items-center gap-1">
<span className="material-symbols-outlined filled" data-icon="medical_services">medical_services</span> Medicare Connect
                </div>
<p className="font-body-md text-body-md text-on-surface-variant">
                    Modern healthcare access, simplified. Find trusted professionals and manage your health seamlessly.
                </p>
<div className="flex gap-2 mt-4">
<a className="text-on-surface-variant hover:text-primary" href="#"><span className="material-symbols-outlined" data-icon="public">public</span></a>
<a className="text-on-surface-variant hover:text-primary" href="#"><span className="material-symbols-outlined" data-icon="share">share</span></a>
</div>
<div className="font-body-md text-body-md text-on-surface-variant mt-10 border-t border-outline-variant pt-4">
                    © 2024 Medicare Connect. All rights reserved.
                </div>
</div>
<div>
<h4 className="font-label-md text-label-md text-on-surface mb-4">Patients</h4>
<ul className="space-y-2">
<li><a className="text-on-surface-variant hover:text-primary hover:underline transition-all cursor-pointer font-body-md text-body-md" href="#">Find Doctors</a></li>
<li><a className="text-on-surface-variant hover:text-primary hover:underline transition-all cursor-pointer font-body-md text-body-md" href="#">Book Appointment</a></li>
<li><a className="text-on-surface-variant hover:text-primary hover:underline transition-all cursor-pointer font-body-md text-body-md" href="#">Video Consult</a></li>
</ul>
</div>
<div>
<h4 className="font-label-md text-label-md text-on-surface mb-4">Providers</h4>
<ul className="space-y-2">
<li><a className="text-on-surface-variant hover:text-primary hover:underline transition-all cursor-pointer font-body-md text-body-md" href="#">Register as Doctor</a></li>
<li><a className="text-on-surface-variant hover:text-primary hover:underline transition-all cursor-pointer font-body-md text-body-md" href="#">Register Clinic</a></li>
<li><a className="text-on-surface-variant hover:text-primary hover:underline transition-all cursor-pointer font-body-md text-body-md" href="#">Provider Portal</a></li>
</ul>
</div>
<div>
<h4 className="font-label-md text-label-md text-on-surface mb-4">Company</h4>
<ul className="space-y-2">
<li><a className="text-on-surface-variant hover:text-primary hover:underline transition-all cursor-pointer font-body-md text-body-md" href="#">About Us</a></li>
<li><a className="text-on-surface-variant hover:text-primary hover:underline transition-all cursor-pointer font-body-md text-body-md" href="#">Contact</a></li>
<li><a className="text-on-surface-variant hover:text-primary hover:underline transition-all cursor-pointer font-body-md text-body-md" href="#">Privacy Policy</a></li>
<li><a className="text-on-surface-variant hover:text-primary hover:underline transition-all cursor-pointer font-body-md text-body-md" href="#">Terms of Service</a></li>
</ul>
</div>
</div>

    </footer>
  );
};

export default Footer;
