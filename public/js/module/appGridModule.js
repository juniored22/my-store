// appSidebarModule.js
import { renderProjectBoxHeaderComponent } from '../components/Grid/index.js';
import { renderProjectBoxContentHeaderComponent } from '../components/Grid/index.js';
import { renderProjectBoxProgressComponent } from '../components/Grid/index.js';
import { renderProjectBoxFooterComponent } from '../components/Grid/index.js';


export function renderGrid() {

    const projects = [
        {
            date: 'December 10, 2020',
            title: 'Web Designing',
            subtitle: 'Prototyping',
            progress: 60,
            participants: [
              'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
              'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d'
            ],
            daysLeft: 2,
            color: '#fee4cb'
          },
        {
          date: 'December 10, 2020',
          title: 'Web Designing',
          subtitle: 'Prototyping',
          progress: 60,
          participants: [
            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
            'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d'
          ],
          daysLeft: 2,
          color: '#ff942e'
        },
        {
          date: 'December 10, 2020',
          title: 'Testing',
          subtitle: 'Prototyping',
          progress: 50,
          participants: [
            'https://images.unsplash.com/photo-1596815064285-45ed8a9c0463',
            'https://images.unsplash.com/photo-1583195764036-6dc248ac07d9'
          ],
          daysLeft: 2,
          color: '#4f3ff0'
        },
        {
          date: 'December 10, 2020',
          title: 'Svg Animations',
          subtitle: 'Prototyping',
          progress: 80,
          participants: [
            'https://images.unsplash.com/photo-1587628604439-3b9a0aa7a163',
            'https://images.unsplash.com/photo-1596815064285-45ed8a9c0463'
          ],
          daysLeft: 2,
          color: '#096c86'
        },
        {
          date: 'December 10, 2020',
          title: 'UI Development',
          subtitle: 'Prototyping',
          progress: 20,
          participants: [
            'https://images.unsplash.com/photo-1600486913747-55e5470d6f40',
            'https://images.unsplash.com/photo-1587628604439-3b9a0aa7a163'
          ],
          daysLeft: 2,
          color: '#df3670'
        }
      ];

    const appGrid = document.querySelector('.project-boxes');
  
    if (appGrid) {

        projects.forEach(project => {

            console.log(project);
            appGrid.innerHTML += `
                <div class="project-box-wrapper">
                <div class="project-box" style="background-color: ${project.color};">
                    ${renderProjectBoxHeaderComponent(project)}
                    ${renderProjectBoxContentHeaderComponent(project)}
                    ${renderProjectBoxProgressComponent(project)}
                    ${renderProjectBoxFooterComponent(project)}
                </div>
                </div>
            `;
          });

        
    }
}
  