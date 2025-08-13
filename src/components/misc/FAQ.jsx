import React from "react";

const FAQ = () => {
    return (
        <div className="max-w-4xl mx-auto p-6 text-left space-y-6">
            <h1 className="text-4xl font-bold">FAQ</h1>

            <section className="space-y-2">
                <h3 className="text-2xl font-semibold">What is GSDB?</h3>
                <p>
                    GSDB (Game Save DataBase) is a platform for uploading and downloading video game save files.
                    You can interact with it through this website, browse the catalog of uploaded save files,
                    or register and upload your own.
                </p>
            </section>

            <section className="space-y-2">
                <h3 className="text-2xl font-semibold">How is GSDB categorized?</h3>
                <p>
                    Save files are categorized by the video game and the platform they belong to. The different
                    video game entries in GSDB are directly extracted from the IGDB service, using certain
                    criteria to ignore repeated versions of different releases that would make categorization harder.
                </p>
                <p>
                    Additionally, they can also be categorized by tags, which define what can be found in the
                    save file and the state of the game progress.
                </p>
                <p>
                    You can use the description and comments of each uploaded save file to get more information.
                </p>
            </section>

            <section className="space-y-2">
                <h3 className="text-2xl font-semibold">How can I download a save file?</h3>
                <p>
                    To download a save file, you can use the quick search or advanced search for save files.
                    You can also access a game through the quick or advanced search, or through the catalog,
                    and then look for the save file you are interested in. Once on the save file page, you
                    can click the download button.
                </p>
            </section>

            <section className="space-y-2">
                <h3 className="text-2xl font-semibold">Are the files safe?</h3>
                <p>
                    Every save file uploaded to GSDB goes through a series of validations. We rely on the
                    service provided by Virustotal, where each uploaded save file is scanned for malware
                    before being accepted into our database.
                </p>
                <p>
                    Additionally, there are three user verification levels: Admin, Verified, and Trusted.
                    The first two are granted by GSDB administrators, and the last one is given by the
                    community to users who have save files with a good average of positive reviews.
                </p>
            </section>

            <section className="space-y-2">
                <h3 className="text-2xl font-semibold">I can't find the game in the search or catalog</h3>
                <p>
                    The entered video game name must match an existing one in IGDB. If the game is not available,
                    you can contact GSDB administrators to have it added.
                </p>
            </section>
            <hr className="border-gray-300 my-6" />

            <p className="text-lg">
                Contact us at: <a href="mailto:jorgbell@ucm.es" className="text-blue-600 hover:underline">jorgbell@ucm.es</a> , <a href="mailto:evalucas@ucm.es" className="text-blue-600 hover:underline">evalucas@ucm.es</a>
            </p>
        </div>

    );
};

export default FAQ;
