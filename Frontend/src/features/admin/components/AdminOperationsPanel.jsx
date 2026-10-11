/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import {
  BarChart3,
  CalendarClock,
  Download,
  FileText,
  GraduationCap,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import {
  assignFacultyToSubject,
  createDepartment,
  createFaculty,
  createSection,
  createStudent,
  createSubject,
  createTimetableSlot,
  deleteDepartment,
  deleteSection,
  deleteSubject,
  deleteTimetableSlot,
  exportAttendanceReport,
  generateLectureSessions,
  getDepartments,
  getDefaultersReport,
  getFaculty,
  getRooms,
  getSections,
  getSectionSubjects,
  getStudents,
  getSubjects,
  getTimetableSlots,
  getAttendanceSummaryReport,
  removeSectionSubject,
} from "../admin.api";

const emptyAcademicForm = {
  departmentName: "",
  departmentCode: "",
  sectionName: "",
  batchYear: "",
  programType: "UG",
  subjectName: "",
  subjectCode: "",
  totalPlannedLectures: "",
};
const emptyUserForm = {
  name: "",
  email: "",
  password: "demo123",
  employeeId: "",
  rollNumber: "",
};
const emptyTimetableForm = {
  sectionSubjectId: "",
  roomId: "",
  dayOfWeek: "1",
  startTime: "09:00",
  endTime: "10:00",
};
const emptyAssignmentForm = {
  sectionId: "",
  subjectId: "",
  facultyProfileId: "",
};
const asItems = (response) => response?.data?.data ?? response?.data ?? [];
const errorMessage = (error, fallback) =>
  error.response?.data?.error || fallback;

function SectionTitle({ icon: Icon, eyebrow, title, action }) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600">
          {eyebrow}
        </p>
        <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-950">
          <Icon className="h-5 w-5 text-indigo-600" />
          {title}
        </h1>
      </div>
      {action}
    </div>
  );
}

function Notice({ error, notice }) {
  if (!error && !notice) return null;
  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm ${error ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}
    >
      {error || notice}
    </div>
  );
}

function Field({ label, name, value, onChange, type = "text", placeholder }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <input
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
      />
    </label>
  );
}

function SelectField({ label, name, value, onChange, children }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
      >
        {children}
      </select>
    </label>
  );
}

function Submit({ children = "Create" }) {
  return (
    <button
      type="submit"
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
    >
      <Plus className="h-4 w-4" />
      {children}
    </button>
  );
}

function Table({ columns, rows, empty = "No records found.", onDelete }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-[0.16em] text-slate-500">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3 font-semibold">
                {column.label}
              </th>
            ))}
            {onDelete && <th className="px-4 py-3" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (onDelete ? 1 : 0)}
                className="px-4 py-8 text-center text-slate-500"
              >
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="whitespace-nowrap px-4 py-3 text-slate-700"
                  >
                    {column.render
                      ? column.render(row)
                      : (row[column.key] ?? "--")}
                  </td>
                ))}
                {onDelete && (
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onDelete(row.id)}
                      className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminOperationsPanel({ tab }) {
  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [slots, setSlots] = useState([]);
  const [academicForm, setAcademicForm] = useState(emptyAcademicForm);
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [assignmentForm, setAssignmentForm] = useState(emptyAssignmentForm);
  const [timetableForm, setTimetableForm] = useState(emptyTimetableForm);
  const [userMode, setUserMode] = useState("faculty");
  const [reportSectionId, setReportSectionId] = useState("");
  const [threshold, setThreshold] = useState("75");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const resetMessages = () => {
    setError("");
    setNotice("");
  };
  const updateForm = (setter) => (event) =>
    setter((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));

  const loadAcademic = async () => {
    const [
      departmentResult,
      sectionResult,
      subjectResult,
      assignmentResult,
      facultyResult,
    ] = await Promise.all([
      getDepartments(),
      getSections(),
      getSubjects(),
      getSectionSubjects(),
      getFaculty(),
    ]);
    setDepartments(asItems(departmentResult));
    setSections(asItems(sectionResult));
    setSubjects(asItems(subjectResult));
    setAssignments(asItems(assignmentResult));
    setFaculty(asItems(facultyResult));
  };
  const loadUsers = async () => {
    const [facultyResult, studentResult] = await Promise.all([
      getFaculty(),
      getStudents(),
    ]);
    setFaculty(asItems(facultyResult));
    setStudents(asItems(studentResult));
    const sectionResult = await getSections();
    setSections(asItems(sectionResult));
    const departmentResult = await getDepartments();
    setDepartments(asItems(departmentResult));
  };
  const loadTimetable = async () => {
    const [slotResult, assignmentResult, roomResult] = await Promise.all([
      getTimetableSlots(),
      getSectionSubjects(),
      getRooms(),
    ]);
    setSlots(asItems(slotResult));
    setAssignments(asItems(assignmentResult));
    setRooms(roomResult.data ?? roomResult);
  };

  useEffect(() => {
    resetMessages();
    setLoading(true);
    setReport(null);
    const load =
      tab === "academic"
        ? loadAcademic
        : tab === "users"
          ? loadUsers
          : tab === "timetable"
            ? loadTimetable
            : async () => {
                const result = await getSections();
                setSections(asItems(result));
              };
    load()
      .catch((loadError) =>
        setError(errorMessage(loadError, "Could not load this admin section.")),
      )
      .finally(() => setLoading(false));
  }, [tab]);

  const handleAcademicSubmit = async (event) => {
    event.preventDefault();
    resetMessages();
    try {
      if (academicForm.departmentName)
        await createDepartment({
          name: academicForm.departmentName,
          code: academicForm.departmentCode,
        });
      else if (academicForm.sectionName)
        await createSection({
          name: academicForm.sectionName,
          departmentId: Number(academicForm.departmentId),
          batchYear: Number(academicForm.batchYear),
          programType: academicForm.programType,
        });
      else
        await createSubject({
          name: academicForm.subjectName,
          code: academicForm.subjectCode,
          departmentId: Number(academicForm.departmentId),
          totalPlannedLectures: Number(academicForm.totalPlannedLectures),
        });
      setAcademicForm(emptyAcademicForm);
      setNotice("Academic record created.");
      await loadAcademic();
    } catch (submitError) {
      setError(errorMessage(submitError, "Could not create academic record."));
    }
  };

  const handleAssignmentSubmit = async (event) => {
    event.preventDefault();
    resetMessages();
    try {
      await assignFacultyToSubject({
        sectionId: Number(assignmentForm.sectionId),
        subjectId: Number(assignmentForm.subjectId),
        facultyProfileId: Number(assignmentForm.facultyProfileId),
      });
      setAssignmentForm(emptyAssignmentForm);
      setNotice("Faculty assignment created.");
      await loadAcademic();
    } catch (submitError) {
      setError(errorMessage(submitError, "Could not create assignment."));
    }
  };

  const handleUserSubmit = async (event) => {
    event.preventDefault();
    resetMessages();
    try {
      if (userMode === "faculty")
        await createFaculty({
          ...userForm,
          departmentId: Number(userForm.departmentId),
        });
      else
        await createStudent({
          ...userForm,
          sectionId: Number(userForm.sectionId),
        });
      setUserForm(emptyUserForm);
      setNotice(
        `${userMode === "faculty" ? "Faculty" : "Student"} account created.`,
      );
      await loadUsers();
    } catch (submitError) {
      setError(errorMessage(submitError, "Could not create account."));
    }
  };

  const handleTimetableSubmit = async (event) => {
    event.preventDefault();
    resetMessages();
    try {
      await createTimetableSlot({
        ...timetableForm,
        sectionSubjectId: Number(timetableForm.sectionSubjectId),
        roomId: timetableForm.roomId ? Number(timetableForm.roomId) : null,
        dayOfWeek: Number(timetableForm.dayOfWeek),
      });
      setNotice("Timetable slot created.");
      await loadTimetable();
    } catch (submitError) {
      setError(errorMessage(submitError, "Could not create timetable slot."));
    }
  };

  const remove = async (action, id, reload, message) => {
    resetMessages();
    try {
      await action(id);
      setNotice(message);
      await reload();
    } catch (removeError) {
      setError(errorMessage(removeError, "Could not delete record."));
    }
  };

  const runReport = async (kind) => {
    resetMessages();
    try {
      const response =
        kind === "summary"
          ? await getAttendanceSummaryReport({ sectionId: reportSectionId })
          : await getDefaultersReport({
              sectionId: reportSectionId,
              threshold,
            });
      setReport({ kind, data: response.data });
    } catch (reportError) {
      setError(errorMessage(reportError, "Could not load report."));
    }
  };

  const download = async (format) => {
    resetMessages();
    try {
      const response = await exportAttendanceReport(format, {
        sectionId: reportSectionId,
        threshold,
      });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `attendance-report.${format === "excel" ? "xlsx" : "pdf"}`;
      link.click();
      URL.revokeObjectURL(url);
      setNotice(`${format.toUpperCase()} report download started.`);
    } catch (downloadError) {
      setError(errorMessage(downloadError, "Could not download report."));
    }
  };

  if (loading)
    return (
      <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-10 text-center text-sm text-slate-500">
        Loading administration data…
      </div>
    );

  if (tab === "academic")
    return (
      <AcademicContent
        {...{
          academicForm,
          setAcademicForm,
          updateForm,
          handleAcademicSubmit,
          departments,
          sections,
          subjects,
          assignments,
          faculty,
          assignmentForm,
          setAssignmentForm,
          handleAssignmentSubmit,
          remove,
          loadAcademic,
          error,
          notice,
        }}
      />
    );
  if (tab === "users")
    return (
      <UsersContent
        {...{
          userMode,
          setUserMode,
          userForm,
          setUserForm,
          updateForm,
          handleUserSubmit,
          faculty,
          students,
          departments,
          sections,
          error,
          notice,
        }}
      />
    );
  if (tab === "timetable")
    return (
      <TimetableContent
        {...{
          timetableForm,
          setTimetableForm,
          updateForm,
          handleTimetableSubmit,
          slots,
          assignments,
          rooms,
          remove,
          loadTimetable,
          error,
          notice,
          setError,
          setNotice,
        }}
      />
    );
  return (
    <ReportsContent
      {...{
        sections,
        reportSectionId,
        setReportSectionId,
        threshold,
        setThreshold,
        runReport,
        download,
        report,
        error,
        notice,
      }}
    />
  );
}

function AcademicContent({
  academicForm,
  setAcademicForm,
  updateForm,
  handleAcademicSubmit,
  departments,
  sections,
  subjects,
  assignments,
  faculty,
  assignmentForm,
  setAssignmentForm,
  handleAssignmentSubmit,
  remove,
  loadAcademic,
  error,
  notice,
}) {
  const [mode, setMode] = useState("department");
  const form =
    mode === "department" ? (
      <>
        <Field
          label="Department name"
          name="departmentName"
          value={academicForm.departmentName}
          onChange={updateForm(setAcademicForm)}
        />
        <Field
          label="Code"
          name="departmentCode"
          value={academicForm.departmentCode}
          onChange={updateForm(setAcademicForm)}
          placeholder="CSE"
        />
      </>
    ) : mode === "section" ? (
      <>
        <Field
          label="Section name"
          name="sectionName"
          value={academicForm.sectionName}
          onChange={updateForm(setAcademicForm)}
        />
        <SelectField
          label="Department"
          name="departmentId"
          value={academicForm.departmentId || ""}
          onChange={updateForm(setAcademicForm)}
        >
          <option value="">Select department</option>
          {departments.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </SelectField>
        <Field
          label="Batch year"
          name="batchYear"
          type="number"
          value={academicForm.batchYear}
          onChange={updateForm(setAcademicForm)}
        />
        <SelectField
          label="Program"
          name="programType"
          value={academicForm.programType}
          onChange={updateForm(setAcademicForm)}
        >
          <option>UG</option>
          <option>PG</option>
          <option>PHD</option>
        </SelectField>
      </>
    ) : (
      <>
        <Field
          label="Subject name"
          name="subjectName"
          value={academicForm.subjectName}
          onChange={updateForm(setAcademicForm)}
        />
        <Field
          label="Code"
          name="subjectCode"
          value={academicForm.subjectCode}
          onChange={updateForm(setAcademicForm)}
          placeholder="CSE301"
        />
        <SelectField
          label="Department"
          name="departmentId"
          value={academicForm.departmentId || ""}
          onChange={updateForm(setAcademicForm)}
        >
          <option value="">Select department</option>
          {departments.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </SelectField>
        <Field
          label="Planned lectures"
          name="totalPlannedLectures"
          type="number"
          value={academicForm.totalPlannedLectures}
          onChange={updateForm(setAcademicForm)}
        />{" "}
      </>
    );
  return (
    <div className="space-y-6">
      <SectionTitle
        icon={GraduationCap}
        eyebrow="Academic setup"
        title="Departments, sections, subjects, and assignments"
      />
      <Notice error={error} notice={notice} />
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <form
          onSubmit={handleAcademicSubmit}
          className="space-y-4 rounded-3xl border border-indigo-100 bg-indigo-50/50 p-5"
        >
          <SelectField
            label="Create record type"
            name="mode"
            value={mode}
            onChange={(event) => setMode(event.target.value)}
          >
            <option value="department">Department</option>
            <option value="section">Section</option>
            <option value="subject">Subject</option>
          </SelectField>
          {form}
          <Submit />
        </form>
        <div className="space-y-4">
          <Table
            columns={[
              { key: "name", label: "Departments" },
              { key: "code", label: "Code" },
            ]}
            rows={departments}
            onDelete={(id) =>
              remove(deleteDepartment, id, loadAcademic, "Department deleted.")
            }
          />
          <Table
            columns={[
              { key: "name", label: "Sections" },
              {
                key: "department",
                label: "Department",
                render: (row) => row.department?.name,
              },
            ]}
            rows={sections}
            onDelete={(id) =>
              remove(deleteSection, id, loadAcademic, "Section deleted.")
            }
          />
          <Table
            columns={[
              { key: "name", label: "Subjects" },
              { key: "code", label: "Code" },
              {
                key: "department",
                label: "Department",
                render: (row) => row.department?.name,
              },
            ]}
            rows={subjects}
            onDelete={(id) =>
              remove(deleteSubject, id, loadAcademic, "Subject deleted.")
            }
          />
        </div>
      </div>
      <form
        onSubmit={handleAssignmentSubmit}
        className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 md:grid-cols-4 md:items-end"
      >
        <SelectField
          label="Section"
          name="sectionId"
          value={assignmentForm.sectionId}
          onChange={(event) =>
            setAssignmentForm((current) => ({
              ...current,
              sectionId: event.target.value,
            }))
          }
        >
          <option value="">Select section</option>
          {sections.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} · {item.department?.name}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Subject"
          name="subjectId"
          value={assignmentForm.subjectId}
          onChange={(event) =>
            setAssignmentForm((current) => ({
              ...current,
              subjectId: event.target.value,
            }))
          }
        >
          <option value="">Select subject</option>
          {subjects.map((item) => (
            <option key={item.id} value={item.id}>
              {item.code} · {item.name}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Faculty profile"
          name="facultyProfileId"
          value={assignmentForm.facultyProfileId}
          onChange={(event) =>
            setAssignmentForm((current) => ({
              ...current,
              facultyProfileId: event.target.value,
            }))
          }
        >
          <option value="">Select faculty</option>
          {faculty.map((item) => (
            <option key={item.facultyProfile.id} value={item.facultyProfile.id}>
              {item.name} · {item.facultyProfile.employeeId}
            </option>
          ))}
        </SelectField>
        <Submit>Assign faculty</Submit>
      </form>
      <Table
        columns={[
          {
            key: "section",
            label: "Section",
            render: (row) => row.section?.name,
          },
          {
            key: "subject",
            label: "Subject",
            render: (row) => row.subject?.code,
          },
          {
            key: "faculty",
            label: "Faculty",
            render: (row) => row.facultyProfile?.user?.name,
          },
        ]}
        rows={assignments}
        onDelete={(id) =>
          remove(removeSectionSubject, id, loadAcademic, "Assignment removed.")
        }
      />
    </div>
  );
}

function UsersContent({
  userMode,
  setUserMode,
  userForm,
  setUserForm,
  updateForm,
  handleUserSubmit,
  faculty,
  students,
  departments,
  sections,
  error,
  notice,
}) {
  return (
    <div className="space-y-6">
      <SectionTitle
        icon={Users}
        eyebrow="Users"
        title="Faculty and student accounts"
      />
      <Notice error={error} notice={notice} />
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <form
          onSubmit={handleUserSubmit}
          className="space-y-4 rounded-3xl border border-indigo-100 bg-indigo-50/50 p-5"
        >
          <SelectField
            label="Account type"
            name="userMode"
            value={userMode}
            onChange={(event) => setUserMode(event.target.value)}
          >
            <option value="faculty">Faculty</option>
            <option value="student">Student</option>
          </SelectField>
          <Field
            label="Name"
            name="name"
            value={userForm.name}
            onChange={updateForm(setUserForm)}
          />
          <Field
            label="Email"
            name="email"
            type="email"
            value={userForm.email}
            onChange={updateForm(setUserForm)}
          />
          <Field
            label="Password"
            name="password"
            type="password"
            value={userForm.password}
            onChange={updateForm(setUserForm)}
          />
          {userMode === "faculty" ? (
            <>
              <Field
                label="Employee ID"
                name="employeeId"
                value={userForm.employeeId}
                onChange={updateForm(setUserForm)}
              />
              <SelectField
                label="Department"
                name="departmentId"
                value={userForm.departmentId || ""}
                onChange={updateForm(setUserForm)}
              >
                <option value="">Select department</option>
                {departments.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </SelectField>
            </>
          ) : (
            <>
              <Field
                label="Roll number"
                name="rollNumber"
                value={userForm.rollNumber}
                onChange={updateForm(setUserForm)}
              />
              <SelectField
                label="Section"
                name="sectionId"
                value={userForm.sectionId || ""}
                onChange={updateForm(setUserForm)}
              >
                <option value="">Select section</option>
                {sections.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} · {item.department?.name}
                  </option>
                ))}
              </SelectField>
            </>
          )}
          <Submit>Create account</Submit>
        </form>
        <div className="space-y-4">
          <Table
            columns={[
              { key: "name", label: "Faculty" },
              { key: "email", label: "Email" },
              {
                key: "profile",
                label: "Employee ID",
                render: (row) => row.facultyProfile?.employeeId,
              },
            ]}
            rows={faculty}
            empty="No faculty accounts found."
          />
          <Table
            columns={[
              { key: "name", label: "Students" },
              { key: "email", label: "Email" },
              {
                key: "profile",
                label: "Roll number",
                render: (row) => row.studentProfile?.rollNumber,
              },
            ]}
            rows={students}
            empty="No student accounts found."
          />
        </div>
      </div>
    </div>
  );
}

function TimetableContent({
  timetableForm,
  setTimetableForm,
  updateForm,
  handleTimetableSubmit,
  slots,
  assignments,
  rooms,
  remove,
  loadTimetable,
  error,
  notice,
}) {
  const [generation, setGeneration] = useState({
    startDate: "",
    endDate: "",
    sectionSubjectId: "",
  });
  const [generationNotice, setGenerationNotice] = useState("");
  const generate = async (event) => {
    event.preventDefault();
    setGenerationNotice("");
    try {
      const response = await generateLectureSessions(generation);
      setGenerationNotice(response.data?.message || "Sessions generated.");
    } catch (generationError) {
      setGenerationNotice(
        errorMessage(generationError, "Could not generate sessions."),
      );
    }
  };
  return (
    <div className="space-y-6">
      <SectionTitle
        icon={CalendarClock}
        eyebrow="Timetable"
        title="Slots and lecture session generation"
      />
      <Notice error={error} notice={notice || generationNotice} />
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <form
          onSubmit={handleTimetableSubmit}
          className="space-y-4 rounded-3xl border border-indigo-100 bg-indigo-50/50 p-5"
        >
          <SelectField
            label="Section subject"
            name="sectionSubjectId"
            value={timetableForm.sectionSubjectId}
            onChange={updateForm(setTimetableForm)}
          >
            <option value="">Select assignment</option>
            {assignments.map((item) => (
              <option key={item.id} value={item.id}>
                {item.section?.name} · {item.subject?.code}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Room"
            name="roomId"
            value={timetableForm.roomId}
            onChange={updateForm(setTimetableForm)}
          >
            <option value="">Room TBD</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Day"
            name="dayOfWeek"
            value={timetableForm.dayOfWeek}
            onChange={updateForm(setTimetableForm)}
          >
            {[
              "Sunday",
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ].map((day, index) => (
              <option key={day} value={index}>
                {day}
              </option>
            ))}
          </SelectField>
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Start"
              name="startTime"
              type="time"
              value={timetableForm.startTime}
              onChange={updateForm(setTimetableForm)}
            />
            <Field
              label="End"
              name="endTime"
              type="time"
              value={timetableForm.endTime}
              onChange={updateForm(setTimetableForm)}
            />
          </div>
          <Submit>Create slot</Submit>
        </form>
        <Table
          columns={[
            {
              key: "sectionSubject",
              label: "Class",
              render: (row) =>
                `${row.sectionSubject?.section?.name || "--"} · ${row.sectionSubject?.subject?.code || "--"}`,
            },
            {
              key: "dayOfWeek",
              label: "Day",
              render: (row) =>
                ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
                  row.dayOfWeek
                ],
            },
            {
              key: "time",
              label: "Time",
              render: (row) => `${row.startTime}–${row.endTime}`,
            },
            {
              key: "faculty",
              label: "Faculty",
              render: (row) => row.sectionSubject?.facultyProfile?.user?.name,
            },
          ]}
          rows={slots}
          onDelete={(id) =>
            remove(
              deleteTimetableSlot,
              id,
              loadTimetable,
              "Timetable slot deleted.",
            )
          }
        />
      </div>
      <form
        onSubmit={generate}
        className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 md:grid-cols-4 md:items-end"
      >
        <Field
          label="Start date"
          name="startDate"
          type="date"
          value={generation.startDate}
          onChange={(event) =>
            setGeneration((current) => ({
              ...current,
              startDate: event.target.value,
            }))
          }
        />
        <Field
          label="End date"
          name="endDate"
          type="date"
          value={generation.endDate}
          onChange={(event) =>
            setGeneration((current) => ({
              ...current,
              endDate: event.target.value,
            }))
          }
        />
        <SelectField
          label="Filter assignment"
          name="sectionSubjectId"
          value={generation.sectionSubjectId}
          onChange={(event) =>
            setGeneration((current) => ({
              ...current,
              sectionSubjectId: event.target.value,
            }))
          }
        >
          <option value="">All assignments</option>
          {assignments.map((item) => (
            <option key={item.id} value={item.id}>
              {item.section?.name} · {item.subject?.code}
            </option>
          ))}
        </SelectField>
        <Submit>Generate sessions</Submit>
      </form>
    </div>
  );
}

function ReportsContent({
  sections,
  reportSectionId,
  setReportSectionId,
  threshold,
  setThreshold,
  runReport,
  download,
  report,
  error,
  notice,
}) {
  return (
    <div className="space-y-6">
      <SectionTitle
        icon={BarChart3}
        eyebrow="Reports"
        title="Attendance analytics and exports"
      />
      <Notice error={error} notice={notice} />
      <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 md:grid-cols-[1fr_180px_auto_auto_auto]">
        <SelectField
          label="Section"
          name="sectionId"
          value={reportSectionId}
          onChange={(event) => setReportSectionId(event.target.value)}
        >
          <option value="">Select section</option>
          {sections.map((section) => (
            <option key={section.id} value={section.id}>
              {section.name} · {section.department?.name}
            </option>
          ))}
        </SelectField>
        <Field
          label="Threshold"
          name="threshold"
          type="number"
          value={threshold}
          onChange={(event) => setThreshold(event.target.value)}
        />
        <button
          type="button"
          onClick={() => runReport("summary")}
          className="mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-indigo-200 px-4 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
        >
          <BarChart3 className="h-4 w-4" />
          Summary
        </button>
        <button
          type="button"
          onClick={() => runReport("defaulters")}
          className="mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-amber-200 px-4 text-sm font-semibold text-amber-700 hover:bg-amber-50"
        >
          <FileText className="h-4 w-4" />
          Defaulters
        </button>
        <div className="mt-auto flex gap-2">
          <button
            type="button"
            onClick={() => download("excel")}
            className="rounded-xl border border-slate-200 p-3 text-slate-600 hover:bg-slate-50"
            aria-label="Download Excel"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => download("pdf")}
            className="rounded-xl border border-slate-200 p-3 text-slate-600 hover:bg-slate-50"
            aria-label="Download PDF"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>
      {report?.kind === "defaulters" && (
        <div className="rounded-3xl border border-amber-200 bg-amber-50/60 p-5">
          <p className="font-semibold text-slate-900">
            {report.data.totalDefaulters} defaulters below{" "}
            {report.data.threshold}%
          </p>
          <Table
            columns={[
              {
                key: "name",
                label: "Student",
                render: (row) => `${row.name} · ${row.rollNumber}`,
              },
              { key: "subjectName", label: "Subject" },
              {
                key: "percentage",
                label: "Attendance",
                render: (row) => `${row.percentage}%`,
              },
            ]}
            rows={report.data.defaulters || []}
          />
        </div>
      )}
      {report?.kind === "summary" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <Table
            columns={[
              {
                key: "name",
                label: "Student",
                render: (row) => `${row.name} · ${row.rollNumber}`,
              },
              {
                key: "subjects",
                label: "Subject summary",
                render: (row) =>
                  row.subjects
                    ?.map(
                      (subject) =>
                        `${subject.subjectCode}: ${subject.percentage}%`,
                    )
                    .join(" · "),
              },
            ]}
            rows={report.data || []}
          />
        </div>
      )}
    </div>
  );
}
