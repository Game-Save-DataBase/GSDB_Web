import '../../styles/misc/About.scss';

function About() {
    return (
        <div className="about-container">
            <h1>About Us</h1>
            <p>
                Game Save Database was born in Madrid as the result of our final degree project in the
                Bachelor’s Degree in Video Game Development at the Complutense University of Madrid.
                Behind the GSDB organization are us, Eva Lucas and Jorge Bello. We are two students who decided
                that our research project would be the development of a platform for the categorization
                and preservation of video game save files on the internet.
            </p>

            <p>
                The history of video game development is intrinsically linked to the evolution of
                hardware and software. Throughout the popularly known video game generations,
                developers have introduced new ways of playing and interacting with games. Innovations
                such as non-volatile memory systems within cartridges or the use of cassettes and floppy
                disks enabled data dumps that allowed users to save their game progress, fundamentally
                changing how games were developed and played. This set of data would come to be known
                as save files or save data.
            </p>

            <p>
                In our project, we analyze and address the challenges of categorizing and preserving
                save files. After investigating their nature and formats throughout history, we decided
                to develop a publicly accessible platform called the Game Save Database (GSDB), which
                provides the structure for creating a repository of save files for use in research,
                conservation, and recreational projects. This website is the main way to interact with
                the GSDB API and its database.
            </p>

            <p>
                Our intention with this database and website is to provide a meeting point for all the
                services on the web dedicated to preserving and studying save files. Projects such as
                {" "}
                <a href="https://github.com/bucanero/apollo-saves" target="_blank" rel="noopener noreferrer">
                    Apollo Database
                </a>, {" "}
                <a href="https://www.thetechgame.com/Downloads.html" target="_blank" rel="noopener noreferrer">
                    The Tech Game
                </a>,  {" "}<a href="https://www.gamesave-manager.com/" target="_blank" rel="noopener noreferrer">
                    GameSave Manager
                </a>, {" "}<a href="https://nicouzouf.com/" target="_blank" rel="noopener noreferrer">
                    Nicouzouf
                </a>,  {" "}<a href="https://gbatemp.net/download/" target="_blank" rel="noopener noreferrer">
                    gbatemp
                </a>, or other services like  {" "}<a href="https://www.devuego.es/bd/" target="_blank" rel="noopener noreferrer">
                    Devuego
                </a> or  {" "}<a href="https://www.nexusmods.com/" target="_blank" rel="noopener noreferrer">
                    Nexus Mods
                </a> have served as inspiration and supported our study,
                in which we concluded that there is a problem of source fragmentation and lack of
                standardization in interfaces and usability. Drawing on more modern web designs and
                other databases such as  {" "}<a href="https://www.igdb.com/" target="_blank" rel="noopener noreferrer">
                    IGDB
                </a>  or  {" "}<a href="https://www.pcgamingwiki.com/wiki/Home" target="_blank" rel="noopener noreferrer">
                    PCGamingWiki
                </a>, we decided to create this proposal.
            </p>

            <p>
                At the  {" "}<a href="https://informatica.ucm.es/" target="_blank" rel="noopener noreferrer">
                    Faculty of Computer Science of the Complutense University of Madrid
                </a>, great
                importance has always been given to the preservation and study of different hardware
                eras, as can be seen in the{" "}
                <a href="https://www.ucm.es/cultura/museo-de-informatica-garcia-santesmases-migs" target="_blank" rel="noopener noreferrer">
                    García-Santesmases Computer Museum (MIGS)
                </a>. We want to follow the same philosophy, but also join the discussion on the
                preservation problem in video games, as organizations such as the{" "}
                <a href="https://gamehistory.org/" target="_blank" rel="noopener noreferrer">
                    Video Game History Foundation
                </a> {" "}
                or{" "}
                <a href="http://archive.org" target="_blank" rel="noopener noreferrer">
                    Archive.org
                </a>{" "}
                have done — especially nowadays, when the line between copyright law and the
                preservation of art and technology related to video games is still very blurry.
            </p>

            <p>
                Save files are a vital part of reproducing these digital works, and their correct
                categorization and preservation can be useful in many cases: from recreational or
                personal backup use; testing or file distribution for developers (for example, in the
                field of Game User Research); uses related to journalism or game studies that allow
                quick access to sections based on save files; observation and study of the structure of
                save files themselves… We believe that a project like GSDB can also be useful for
                integration into other preservation and categorization projects, in the same way that
                we have relied on others like IGDB or PCGamingWiki for the development of this
                platform.
            </p>

            <p>
                For more information about using GSDB, you can access the {" "}
                <a href="/FAQ" target="_blank" rel="noopener noreferrer">
                    FAQ section.
                </a>
            </p>
        </div>
    );
}

export default About;
