import { configureStore } from '@reduxjs/toolkit';
import authReducer          from '../features/auth/authSlice';
import countriesReducer     from '../features/countries/countriesSlice';
import adminReducer         from '../features/admin/adminSlice';
import gradesReducer        from '../features/admin/gradesSlice';
import categoriesReducer    from '../features/admin/categoriesSlice';
import coursesReducer       from '../features/admin/coursesSlice';
import adminUsersReducer    from '../features/admin/usersSlice';
import packagesReducer      from '../features/admin/packagesSlice';
import liveClassesReducer   from '../features/admin/liveClassesSlice';
import subscriptionsReducer from '../features/admin/subscriptionsSlice';
import notificationsReducer from '../features/notifications/notificationsSlice';
import courseContentReducer from '../features/admin/courseContentSlice';
import teacherExamsReducer  from '../features/teacher/examSlice';
import studentReducer       from '../features/student/studentSlice';
import courseProgressReducer from '../features/student/courseProgressSlice';
import studentExamReducer   from '../features/student/examSlice';
import reportReducer        from '../features/student/reportSlice';
import teacherReducer       from '../features/teacher/teacherSlice';
import parentReducer        from '../features/parent/parentSlice';
import supervisorReducer    from '../features/supervisor/supervisorSlice';
import gamificationReducer  from '../features/student/gamificationSlice';
import leagueReducer        from '../features/student/leagueSlice';
import agoraReducer         from '../features/live/agoraSlice';

export const store = configureStore({
  reducer: {
    auth:           authReducer,
    countries:      countriesReducer,
    admin:          adminReducer,
    grades:         gradesReducer,
    categories:     categoriesReducer,
    courses:        coursesReducer,
    adminUsers:     adminUsersReducer,
    packages:       packagesReducer,
    liveClasses:    liveClassesReducer,
    subscriptions:  subscriptionsReducer,
    notifications:  notificationsReducer,
    courseContent:  courseContentReducer,
    teacherExams:   teacherExamsReducer,
    student:        studentReducer,
    courseProgress: courseProgressReducer,
    studentExam:    studentExamReducer,
    report:         reportReducer,
    teacher:        teacherReducer,
    parent:         parentReducer,
    supervisor:     supervisorReducer,
    gamification:   gamificationReducer,
    league:         leagueReducer,
    agora:          agoraReducer,
  },
});

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
