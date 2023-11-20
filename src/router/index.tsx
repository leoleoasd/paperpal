import { createRouter, createWebHistory } from 'vue-router';
import PaperListView from '@/views/PaperListView.vue';

// let auth: null | ReturnType<typeof useAuthStore> = null;

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: PaperListView,
    },
    // {
    //   path: '/',
    //   name: 'sequence_tag',
    //   component: SequenceTag,
    // }
    // {
    //   path: '/test',
    //   name: 'incontextlabel',
    //   component: IncontextLabeling,
    // },
    // {
    //   path: '/',
    //   alias: ['/projects', '/project'],
    //   name: 'home',
    //   component: ProjectsView,
    // },
    // {
    //   path: '/project/new',
    //   name: 'project.new',
    //   component: CreateProjectView,
    // },
    // {
    //   path: '/project/:projectId',
    //   name: 'project',
    //   component: ProjectView,
    //   props: true,
    // },
    // {
    //   path: '/project/:projectId/label/:labelId',
    //   name: 'label',
    //   component: LabelView,
    //   props: true,
    // }
    // {
    //   name: 'login',
    //   path: '/login',
    //   component: Login,
    //   meta: {
    //     authenticate: false,
    //   }
    // },
    // // register
    // {
    //   name: 'register',
    //   path: '/register',
    //   component: Register,
    //   meta: {
    //     authenticate: false,
    //   }
    // },
    // {
    //   name: 'label',
    //   path: '/project/:projectId/label/:labelId',
    //   component: LabelView,
    //   props: true,
    // }
  ],
});


// router.beforeEach((to, from) => {
//   console.log('before each', to);
//   if (auth === null ){
//     auth = useAuthStore();
//   }
//   if (to.meta.authenticate !== false && !auth.logged) {
//     return {
//       name: 'login'
//     };
//   } else if (to.meta.authenticate === false && auth.logged) {
//     return {
//       path: '/'
//     };
//   }
// });

export default router;
