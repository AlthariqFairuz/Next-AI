const Footer  = () => {
    return (   
    <footer className="bg-background border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2">
                <div className="relative w-6 h-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-white to-black rounded-full"></div>
                    <div className="absolute inset-1 bg-black rounded-full"></div>
                </div>
                <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">NEXT AI</span>
                </div>
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
                <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Documentation</a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Support</a>
                </div>
                <p className="text-sm text-muted-foreground">
                &copy; 2025 NEXT AI. All rights reserved.
                </p>
            </div>
        </div>
    </footer>
    );
}

export default Footer;