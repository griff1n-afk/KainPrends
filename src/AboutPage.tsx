import './AboutPage.css'
import { Link } from "react-router-dom"
import { ArrowUpRight, ArrowRight, Compass, Heart, ChefHat } from 'lucide-react'
import aboutOurStoryImg from './assets/about-ourstory.png';
import aboutCreatorImg from './assets/about-creator.jpg';

export default function AboutPage(){

    return(
        <>
            <section className="about-hero">
                <h1 className="about-hero-title">About KainPrends</h1>
                <p className="about-hero-statement">Good food is better when shared.</p>
                <p className="about-hero-subtitle">Bringing home cooks, favorite recipes, and the joy of sharing food together in one place.</p>
            </section>

            <section className="about-story">
                <div className="about-story-image-wrap">
                    <img src={aboutOurStoryImg} alt="Cooking and food preparation" className="about-story-image" />
                </div>
                <div className="about-story-content">
                    <div className="about-label-row">
                        <span className="about-label-line" />
                        <h2 className="about-section-label">Our Story</h2>
                    </div>
                    <p className="about-story-statement">More than just a recipe collection.</p>
                    <p className="about-story-text">
                        KainPrends started as a personal project built around something familiar—food. I wanted to create more than a place to simply browse recipes, but a space where home cooks could discover new dishes, save the ones they love, and share their own creations with others.
                    </p>
                    <p className="about-story-text">
                        What began as an idea became an opportunity to build a complete recipe-sharing experience from the ground up, combining thoughtful design with the functionality that makes discovering and sharing food simple and enjoyable.
                    </p>
                </div>
            </section>

            <section className="about-name">
                <div className="about-label-row about-label-row-center">
                    <h2 className="about-section-label about-section-label-light">Behind the Name</h2>
                </div>
                <p className="about-name-tagline">Two words. One idea.</p>

                <div className="about-name-equation">
                    <div className="about-name-word">
                        <h3>KAIN</h3>
                        <span className="about-name-meaning">to eat</span>
                    </div>

                    <span className="about-name-symbol">+</span>

                    <div className="about-name-word">
                        <h3>PRENDS</h3>
                        <span className="about-name-meaning">friends</span>
                    </div>
                </div>

                <div className="about-name-result">
                    <span className="about-name-symbol">=</span>
                    <h3>KainPrends</h3>
                </div>

                <p className="about-name-tagline">
                    “Prends” is a nickname I use for my friends—one that naturally evolved from the way we call each other. Paired with “kain,” it became KainPrends: a name built around food, friendship, and sharing.
                </p>
            </section>

            <section className="about-features">
                <div className="about-features-inner">
                    <div className="about-label-row about-label-row-center">
                        <h2 className="about-section-label">What You Can Do</h2>
                    </div>
                    <p className="about-features-heading">Made for people who love good food.</p>

                    <div className="about-features-list">
                        <div className="about-feature">
                            <Compass size={28} className="about-feature-icon" />
                            <span className="about-feature-number">01</span>
                            <h3 className="about-feature-title">Discover</h3>
                            <p className="about-feature-text">Find recipes by name, ingredients, category, or cooking time.</p>
                        </div>

                        <div className="about-feature">
                            <Heart size={28} className="about-feature-icon" />
                            <span className="about-feature-number">02</span>
                            <h3 className="about-feature-title">Save</h3>
                            <p className="about-feature-text">Keep the recipes you love in one place and come back to them anytime.</p>
                        </div>

                        <div className="about-feature">
                            <ChefHat size={28} className="about-feature-icon" />
                            <span className="about-feature-number">03</span>
                            <h3 className="about-feature-title">Share</h3>
                            <p className="about-feature-text">Create your own recipes and share them with other home cooks.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="about-creator">
                <div className="about-creator-text-block">
                    <div className="about-creator-header">
                        <div className="about-label-row">
                            <span className="about-label-line" />
                            <h2 className="about-section-label">Meet the Creator</h2>
                        </div>
                        <h3 className="about-creator-greeting">Hi, I'm Griffin.</h3>
                    </div>

                    <div className="about-creator-body">
                        <p className="about-creator-text">
                            I'm an IT graduate with an interest in web development and creating practical, user-focused digital experiences. KainPrends is my first full portfolio project, built as a way to turn what I've learned into a complete web application.
                        </p>
                        <p className="about-creator-text">
                            From designing the interface to building the features behind it, this project has given me the opportunity to strengthen my development, problem-solving, and user experience design skills.
                        </p>
                    </div>

                    <div className="about-creator-footer">
                        <h4 className="about-creator-stack-label">Built With</h4>
                        <div className="about-creator-stack">
                            <span className="about-stack-pill">React</span>
                            <span className="about-stack-pill">Supabase</span>
                            <span className="about-stack-pill">JavaScript</span>
                            <span className="about-stack-pill">CSS</span>
                        </div>

                        <div className="about-creator-links">
                            <a href="https://github.com/griff1n-afk/KainPrends" target="_blank" rel="noopener noreferrer" className="about-creator-link about-creator-link-primary">
                                GitHub <ArrowUpRight size={16} />
                            </a>
                            <a href="#" className="about-creator-link about-creator-link-secondary">
                                View Portfolio <ArrowUpRight size={16} />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="about-creator-photo-wrap">
                    <img src={aboutCreatorImg} alt="Griffin, creator of KainPrends" className="about-creator-photo" />
                </div>
            </section>

            <section className="about-cta">
                <h2 className="about-cta-title">Ready to Start Cooking?</h2>
                <p className="about-cta-subtitle">Hungry for something good?</p>
                <p className="about-cta-text">Discover recipes worth trying, saving, and sharing with your prends.</p>
                <Link to="/recipes" className="about-cta-button">
                    Explore Recipes <ArrowRight size={18} />
                </Link>
            </section>
        </>
    )
}