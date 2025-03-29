import React from 'react';
import './ResourcesPage.css';

const ResourcesPage = () => {
  const resources = [
    {
      id: 1,
      title: 'Emergency Preparedness Guide',
      description: 'Complete guide to preparing for different types of disasters',
      link: 'https://www.ready.gov/plan',
      category: 'preparation',
      icon: 'book'
    },
    {
      id: 2,
      title: 'FEMA Emergency App',
      description: 'Official app from FEMA with real-time alerts and safety tips',
      link: 'https://www.fema.gov/about/news-multimedia/mobile-products',
      category: 'tools',
      icon: 'mobile-alt'
    },
    {
      id: 3,
      title: 'Red Cross First Aid',
      description: 'First aid procedures and emergency protocols',
      link: 'https://www.redcross.org/get-help/how-to-prepare-for-emergencies.html',
      category: 'medical',
      icon: 'first-aid'
    },
    {
      id: 4,
      title: 'National Weather Service',
      description: 'Weather forecasts and severe weather warnings',
      link: 'https://www.weather.gov/',
      category: 'weather',
      icon: 'cloud-sun-rain'
    },
    {
      id: 5,
      title: 'Ready.gov Kids Resources',
      description: 'Emergency preparedness resources for children and families',
      link: 'https://www.ready.gov/kids',
      category: 'family',
      icon: 'child'
    },
    {
      id: 6,
      title: 'CDC Emergency Response',
      description: 'Health guidance during disasters and public health emergencies',
      link: 'https://emergency.cdc.gov/',
      category: 'health',
      icon: 'hospital'
    },
    {
      id: 7,
      title: 'Disaster Distress Helpline',
      description: '24/7 crisis counseling for disaster-related distress',
      link: 'https://www.samhsa.gov/find-help/disaster-distress-helpline',
      category: 'mental',
      icon: 'heart'
    },
    {
      id: 8,
      title: 'Pet Preparedness',
      description: 'Guidelines for keeping pets safe during emergencies',
      link: 'https://www.ready.gov/pets',
      category: 'pets',
      icon: 'paw'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Resources', icon: 'layer-group' },
    { id: 'preparation', name: 'Preparation', icon: 'clipboard-check' },
    { id: 'tools', name: 'Tools & Apps', icon: 'tools' },
    { id: 'medical', name: 'Medical & First Aid', icon: 'first-aid' },
    { id: 'weather', name: 'Weather Information', icon: 'cloud-sun-rain' },
    { id: 'family', name: 'Family & Children', icon: 'users' },
    { id: 'health', name: 'Health & Safety', icon: 'hospital' },
    { id: 'mental', name: 'Mental Health', icon: 'brain' },
    { id: 'pets', name: 'Pet Safety', icon: 'paw' }
  ];

  const [activeCategory, setActiveCategory] = React.useState('all');
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredResources = resources.filter(resource => {
    const matchesCategory = activeCategory === 'all' || resource.category === activeCategory;
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="resources-page">
      <div className="resources-header">
        <h1>Emergency Resources</h1>
        <p>Helpful guides, tools, and information for disaster preparedness</p>
      </div>

      <div className="search-bar">
        <div className="search-input">
          <i className="fas fa-search"></i>
          <input 
            type="text" 
            placeholder="Search resources..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              className="clear-search" 
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
      </div>

      <div className="categories-filter">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(category.id)}
          >
            <i className={`fas fa-${category.icon}`}></i>
            <span>{category.name}</span>
          </button>
        ))}
      </div>

      {filteredResources.length > 0 ? (
        <div className="resources-grid">
          {filteredResources.map(resource => (
            <div key={resource.id} className="resource-card">
              <div className="resource-icon">
                <i className={`fas fa-${resource.icon}`}></i>
              </div>
              <div className="resource-content">
                <h3>{resource.title}</h3>
                <p>{resource.description}</p>
                <a 
                  href={resource.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="resource-link"
                >
                  <span>Visit Resource</span>
                  <i className="fas fa-external-link-alt"></i>
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-results">
          <i className="fas fa-search"></i>
          <h3>No resources found</h3>
          <p>Try adjusting your search or filter criteria</p>
          <button onClick={() => {setSearchTerm(''); setActiveCategory('all');}}>
            Reset Filters
          </button>
        </div>
      )}

      <div className="resource-suggestion">
        <h2>Don't see what you're looking for?</h2>
        <p>We're constantly updating our resource collection.</p>
        <button className="suggest-btn">
          <i className="fas fa-plus-circle"></i>
          <span>Suggest a Resource</span>
        </button>
      </div>

      <div className="resource-disclaimer">
        <p>
          <strong>Disclaimer:</strong> These resources are provided for informational purposes only. 
          Always follow official guidance from local authorities in an emergency situation.
        </p>
      </div>
    </div>
  );
};

export default ResourcesPage; 