/* Course structure helpers. Unit files call CL.addUnit(...). */
(function () {
  'use strict';
  const CL = (window.CL = window.CL || {});
  const units = [];
  const L = {
    text: md => ({ t: 'text', md }),
    widget: (w, md, p) => ({ t: 'widget', w, md, p: p || {} }),
    mc: (md, choices, a, explain) => ({ t: 'mc', md, choices, a, explain }),
    input: (md, ans, explain, placeholder) => ({ t: 'input', md, ans, explain, placeholder }),
    practice: (skill, level = 1, md) => ({ t: 'practice', skill, level, md })
  };
  CL.L = L;
  CL.addUnit = u => { units.push(u); };

  CL.course = {
    units,
    lessonList() { return units.flatMap(u => u.lessons.map(l => ({ ...l, unit: u.id }))); },
    lesson(id) { for (const u of units) { const l = u.lessons.find(x => x.id === id); if (l) return { ...l, unit: u.id, unitObj: u }; } return null; },
    unit(id) { return units.find(u => u.id === id); },
    unitOfSkill(skillId) { const sk = CL.gen.skills[skillId]; return sk ? units.find(u => u.id === sk.unit) : null; },
    lessonForSkill(skillId) { for (const u of units) for (const l of u.lessons) if ((l.skills || []).includes(skillId)) return l; return null; },
    nextLesson(id) { const list = this.lessonList(); const i = list.findIndex(l => l.id === id); return i >= 0 ? list[i + 1] || null : null; },
    skillsOfUnit(uid) { return Object.values(CL.gen.skills).filter(s => s.unit === uid); }
  };
})();
