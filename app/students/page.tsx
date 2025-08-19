"use client"

import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabase"

export default function Students() {
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    Name: "",
    Address: "",
    Phone: "",
    Observacion: "",
  })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState("")

  // Cargar estudiantes
  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("student")
        .select("*")
        .order("id", { ascending: true })

      if (error) throw error
      setStudents(data || [])
    } catch (err: any) {
      console.error("Error fetching students:", err)
      setError("Error al cargar estudiantes")
    } finally {
      setLoading(false)
    }
  }

  const createStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase
        .from("student")
        .insert([formData])
        .select()

      if (error) throw error
      setStudents([...students, ...data])
      resetForm()
      setError("")
    } catch (err: any) {
      setError("Error al crear estudiante: " + err.message)
    }
  }

  const updateStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase
        .from("student")
        .update(formData)
        .eq("id", editingId)
        .select()

      if (error) throw error
      setStudents(
        students.map((student) =>
          student.id === editingId ? data[0] : student
        )
      )
      resetForm()
      setError("")
    } catch (err: any) {
      setError("Error al actualizar estudiante: " + err.message)
    }
  }

  const deleteStudent = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este estudiante?")) return
    try {
      const { error } = await supabase.from("student").delete().eq("id", id)
      if (error) throw error
      setStudents(students.filter((student) => student.id !== id))
    } catch (err: any) {
      setError("Error al eliminar estudiante: " + err.message)
    }
  }

  const editStudent = (student: any) => {
    setFormData({
      Name: student.Name,
      Address: student.Address,
      Phone: student.Phone,
      Observacion: student.Observacion,
    })
    setEditingId(student.id)
  }

  const resetForm = () => {
    setFormData({ Name: "", Address: "", Phone: "", Observacion: "" })
    setEditingId(null)
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  if (loading) return <div className="p-6 text-lg">⏳ Cargando estudiantes...</div>

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
          📚 Gestión de Estudiantes
        </h1>

        {error && (
          <div className="bg-red-200 border border-red-400 text-red-800 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Formulario */}
        <div className="bg-gray-50 shadow-lg rounded-lg px-8 pt-6 pb-8 mb-6 border border-gray-200">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">
            {editingId ? "✏️ Editar Estudiante" : "➕ Nuevo Estudiante"}
          </h2>

          <form
            onSubmit={editingId ? updateStudent : createStudent}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Nombre
              </label>
              <input
                type="text"
                name="Name"
                value={formData.Name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Teléfono
              </label>
              <input
                type="text"
                name="Phone"
                value={formData.Phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-700 font-medium mb-2">
                Dirección
              </label>
              <input
                type="text"
                name="Address"
                value={formData.Address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-700 font-medium mb-2">
                Observaciones
              </label>
              <textarea
                name="Observacion"
                value={formData.Observacion}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              />
            </div>

            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
              >
                {editingId ? "Actualizar" : "Crear"} Estudiante
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Lista de estudiantes */}
        <div className="bg-gray-50 shadow-lg rounded-lg border border-gray-200">
          <h2 className="text-2xl font-semibold p-4 border-b text-gray-700">
            📋 Lista de Estudiantes
          </h2>

          {students.length === 0 ? (
            <p className="p-4 text-gray-500">No hay estudiantes registrados</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-200">
                  <tr>
                    {["ID", "Nombre", "Teléfono", "Dirección", "Observaciones", "Acciones"].map((header) => (
                      <th
                        key={header}
                        className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-amber-300 transition"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {student.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {student.Name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {student.Phone}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {student.Address}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {student.Observacion}
                      </td>
                      <td className="p-3 border-b text-center space-x-2">
                        <button
                          onClick={() => editStudent(student)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md transition-transform transform hover:scale-105"
                        >
                          ✏️Editar
                        </button>
                        <button
                          onClick={() => deleteStudent(student.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-md transition-transform transform hover:scale-105"
                        >
                          🗑️Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
