import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="fixed bottom-0 left-0 right-0 z-10 py-2 bg-gradient-to-r from-brand-indigo via-brand-purple to-purple-500 text-center text-white text-xs shadow-t-lg">
            <p className="font-semibold">Demian 임정훈</p>
            <p className="opacity-80">© 2025 All Rights Reserved.</p>
        </footer>
    );
};

export default Footer;