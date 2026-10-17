import re

with open('src/components/Dashboard.tsx', 'r') as f:
    content = f.read()

cache_code = """
const dashboardCache = new Map<string, { curricula: any[], totalTopics: number, totalQuizzes: number, streak: number, masteryStats: any }>();
"""

content = content.replace("export function Dashboard", cache_code + "\nexport function Dashboard")

fetch_dash = """  const fetchDashboardData = async () => {
    setView('loading');
    
    // 1. Fetch curricula"""

fetch_dash_new = """  const fetchDashboardData = async (forceRefetch = false) => {
    const cacheKey = userId;
    if (!forceRefetch && dashboardCache.has(cacheKey)) {
        const cached = dashboardCache.get(cacheKey)!;
        setCurricula(cached.curricula);
        setTotalTopics(cached.totalTopics);
        setTotalQuizzes(cached.totalQuizzes);
        setStreak(cached.streak);
        setMasteryStats(cached.masteryStats);
        
        if (cached.curricula.length === 0) {
            setView('upload');
        } else {
            setView('home');
        }
        // Fetch in background
        fetchData();
        return;
    }
    setView('loading');
    await fetchData();
  };
  
  const fetchData = async () => {
    // 1. Fetch curricula"""
    
content = content.replace(fetch_dash, fetch_dash_new)

fetch_end = """    setMasteryStats({
       notStarted: Math.round((notStarted / totalTopicsMastery) * 100),
       inProgress: Math.round((inProgress / totalTopicsMastery) * 100),
       mastered: Math.round((mastered / totalTopicsMastery) * 100)
    });


    if (currsList.length === 0) {"""
    
fetch_end_new = """    const newMastery = {
       notStarted: Math.round((notStarted / totalTopicsMastery) * 100),
       inProgress: Math.round((inProgress / totalTopicsMastery) * 100),
       mastered: Math.round((mastered / totalTopicsMastery) * 100)
    };
    setMasteryStats(newMastery);

    dashboardCache.set(userId, { curricula: enrichedCurricula, totalTopics: totalT, totalQuizzes: quizCount || 0, streak: streakData?.current_streak || 0, masteryStats: newMastery });

    if (currsList.length === 0) {"""

content = content.replace(fetch_end, fetch_end_new)

on_upload = """<CurriculumUpload userId={userId} onUploadComplete={fetchDashboardData} />"""
on_upload_new = """<CurriculumUpload userId={userId} onUploadComplete={() => fetchDashboardData(true)} />"""
content = content.replace(on_upload, on_upload_new)

with open('src/components/Dashboard.tsx', 'w') as f:
    f.write(content)
