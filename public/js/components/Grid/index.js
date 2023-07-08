export const renderProjectBoxHeaderComponent = (project) =>{
    return `
      <div class="project-box-header">
        <span>${project.date}</span>
        <div class="more-wrapper">
          <button class="project-btn-more">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-more-vertical">
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </button>
        </div>
      </div>
    `;
}

export const renderProjectBoxContentHeaderComponent = (project) => {
    return `
      <div class="project-box-content-header">
        <p class="box-content-header">${project.title}</p>
        <p class="box-content-subheader">${project.subtitle}</p>
      </div>
    `;
  }

  export const renderProjectBoxProgressComponent = (project) => {
    return `
      <div class="box-progress-wrapper">
        <p class="box-progress-label">${project.progress}%</p>
        <div class="box-progress-bar">
          <div class="box-progress" style="width: ${project.progress}%; background-color: ${project.color};"></div>
        </div>
      </div>
    `;
  }


  export const renderProjectBoxFooterComponent = (project) => {
    return `
      <div class="project-box-footer">
        <div class="participants">
          ${project.participants.map(participant => `<img src="${participant}" alt="Participant">`).join('')}
        </div>
        <div class="days-left">
          <p>${project.daysLeft} days left</p>
        </div>
      </div>
    `;
  }

